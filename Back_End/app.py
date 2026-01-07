import os
import sqlite3
import pdfplumber
import pandas as pd
from dotenv import load_dotenv

# LangChain & LangGraph Imports
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.tools import tool
from langchain_core.documents import Document
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.sqlite import SqliteSaver

from engine.tax_engine import calculate_tax_impact

load_dotenv()


class TaxAssistant:
    def __init__(self, pdf_directory="tax_files", db_path="tax_files/docstore"):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.pdf_directory = pdf_directory
        self.db_path = db_path

        # Initialize models
        self.llm = ChatOpenAI(model="gpt-4o-mini", temperature=0, api_key=self.api_key)
        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=self.api_key
        )

        # Initialize vector store
        self.vector_store = self._initialize_vector_store()
        self.retriever = self.vector_store.as_retriever(search_kwargs={"k": 3})

        # Tools and graph
        self.tools = self._setup_tools()
        self.tool_node = ToolNode(self.tools)
        self.builder = self._build_graph()

        # Initialize SQLite checkpointer once
        self.checkpointer = self._initialize_checkpointer()


    def _initialize_checkpointer(self):
        try:
            os.makedirs("tax_files", exist_ok=True)
            db_path = os.path.abspath("tax_files/conversations.db")
            print(f"SQLite database: {db_path}")

            conn = sqlite3.connect(db_path, check_same_thread=False)
            checkpointer = SqliteSaver(conn)

            print("SQLite checkpointer initialized successfully")
            return checkpointer

        except Exception as e:
            print(f"Failed to initialize SQLite checkpointer: {str(e)}")
            raise


    def _setup_tools(self):

        @tool
        def retriever_tool(query: str) -> str:
            """Searches Nigerian tax laws for exemptions, rules, and regulations."""
            docs = self.retriever.invoke(query)
            return "\n\n---\n\n".join([
                f"Source: {d.metadata.get('source', 'Unknown')} | Page {d.metadata.get('page', 'N/A')}\n\n{d.page_content[:1000]}..."
                for d in docs
            ])

        @tool
        def calculate_nigeria_tax_2025(monthly_income: float) -> str:
            """
            Calculates Nigerian PAYE tax impact based on proposed 2025/2026 reform.
            Accepts monthly income only.
            """
            try:
                result = calculate_tax_impact(monthly_income)

                current = result["current"]
                proposed = result["proposed"]
                impact = result["impact"]

                return f"""
📊 **Nigeria PAYE Tax Impact (Reform Analysis)**

**Income**
• Monthly Income: ₦{result['monthly_income']:,.2f}
• Annual Income: ₦{result['annual_income']:,.2f}

**Current System ({current['label']})**
• Annual Tax: ₦{current['annual_tax']:,.2f}
• Effective Rate: {current['effective_rate']}%

**Proposed Reform ({proposed['label']})**
• Annual Tax: ₦{proposed['annual_tax']:,.2f}
• Effective Rate: {proposed['effective_rate']}%
• Classification: {proposed.get('classification', 'N/A')}

**Impact**
• Annual Relief: ₦{impact['annual_relief']:,.2f}
• Monthly Relief: ₦{impact['monthly_relief']:,.2f}
• Change: {impact['percentage_change']}%

💡 *Estimate based on reform proposals.*
"""
            except Exception as e:
                return f"Tax calculation failed: {str(e)}"

        return [retriever_tool, calculate_nigeria_tax_2025]


    def _load_all_pdfs(self):
        documents = []
        if not os.path.exists(self.pdf_directory):
            os.makedirs(self.pdf_directory)
            return documents

        for filename in os.listdir(self.pdf_directory):
            if filename.lower().endswith(".pdf"):
                with pdfplumber.open(os.path.join(self.pdf_directory, filename)) as pdf:
                    for i, page in enumerate(pdf.pages):
                        text = page.extract_text() or ""
                        if text.strip():
                            documents.append(Document(
                                page_content=text,
                                metadata={"source": filename, "page": i + 1}
                            ))
        return documents


    def _initialize_vector_store(self):
        os.makedirs(self.db_path, exist_ok=True)

        if os.path.exists(os.path.join(self.db_path, "chroma.sqlite3")):
            return Chroma(
                persist_directory=self.db_path,
                embedding_function=self.embeddings
            )

        docs = self._load_all_pdfs()
        if not docs:
            return Chroma(
                persist_directory=self.db_path,
                embedding_function=self.embeddings
            )

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        chunks = splitter.split_documents(docs)

        return Chroma.from_documents(
            documents=chunks,
            embedding=self.embeddings,
            persist_directory=self.db_path
        )


    def _build_graph(self):

        def llm_node(state: MessagesState):
            system = SystemMessage(content="You are a Nigeria Tax Assistant.")
            messages = [system] + state["messages"]
            llm_with_tools = self.llm.bind_tools(self.tools)
            response = llm_with_tools.invoke(messages)
            return {"messages": [response]}

        def should_use_tools(state: MessagesState):
            last = state["messages"][-1]
            if hasattr(last, "tool_calls") and last.tool_calls:
                return "tools"
            return END

        builder = StateGraph(MessagesState)
        builder.add_node("assistant", llm_node)
        builder.add_node("tools", self.tool_node)

        builder.add_edge(START, "assistant")
        builder.add_conditional_edges("assistant", should_use_tools)
        builder.add_edge("tools", "assistant")

        return builder


    def ask_question(self, question: str, user_id: str = "default"):
        try:
            agent = self.builder.compile(checkpointer=self.checkpointer)
            result = agent.invoke(
                {"messages": [HumanMessage(content=question)]},
                {"configurable": {"thread_id": user_id}}
            )
            return result["messages"][-1].content
        except Exception:
            response = self.llm.invoke([HumanMessage(content=question)])
            return response.content

    # --- ADDED STREAMING METHOD ---
    # def ask_question_stream(self, question: str):
    #     """Streams the response token by token."""
    #     # For true streaming without blocking, we use the LLM directly
    #     messages = [
    #         SystemMessage(content="You are a Nigeria Tax Assistant. Answer helpfully and concisely. If you are asked a question that is unrelated to taxes, politely decline and state that you are Tax assistant. Also, only answer questions related to Nigerian tax laws and regulations."),
    #         HumanMessage(content=question)
    #     ]
        
    #     # This yields chunks of text as they are generated
    #     for chunk in self.agent.stream(messages):
    #         if chunk.content:
    #             yield chunk.content
    
    def ask_question_stream(self, question: str, user_id: str = "default"):
        """
        Uses the compiled Agent (connected to RAG) to generate the response.
        Yields the final response content.
        """
        try:
            # 1. Compile the agent (same as ask_question)
            agent = self.builder.compile(checkpointer=self.checkpointer)
            
            # 2. Prepare the input payload
            inputs = {"messages": [HumanMessage(content=question)]}
            config = {"configurable": {"thread_id": user_id}}
            
            # 3. Stream the graph execution
            # 'stream_mode="updates"' yields the output of each node as it completes.
            # This ensures the RAG tools are called before the final answer is yielded.
            for output in agent.stream(inputs, config=config, stream_mode="updates"):
                # output structure is like: {'node_name': {'messages': [Message, ...]}}
                for node_name, state_update in output.items():
                    # Check if this update contains messages
                    if "messages" in state_update:
                        messages = state_update["messages"]
                        if messages:
                            last_msg = messages[-1]
                            # We only want to yield the final text response from the AI
                            # (skipping tool call messages)
                            if last_msg.content:
                                yield last_msg.content

        except Exception as e:
            # Fallback to pure LLM if the Agent crashes (matches your previous logic)
            # You might want to log 'e' here for debugging
            response = self.llm.invoke([HumanMessage(content=question)])
            yield response.content


assistant = None

def get_tax_assistant():
    global assistant
    if assistant is None:
        assistant = TaxAssistant()
    return assistant