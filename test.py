import sqlite3
import uuid

# -----------------------------
# 1️⃣ Setup DB / table
# -----------------------------
DB_PATH = "tax_files/conversation_messages.db"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS conversation_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)
""")
conn.commit()

# -----------------------------
# 2️⃣ Helper functions
# -----------------------------
def save_message(thread_id: str, role: str, content: str):
    cur.execute(
        "INSERT INTO conversation_messages (thread_id, role, content) VALUES (?, ?, ?)",
        (thread_id, role, content)
    )
    conn.commit()

def get_conversation_history(thread_id: str):
    cur.execute(
        "SELECT role, content FROM conversation_messages WHERE thread_id=? ORDER BY id ASC",
        (thread_id,)
    )
    rows = cur.fetchall()
    return [{"role": r, "content": c} for r, c in rows]

# -----------------------------
# 3️⃣ Simulate a session
# -----------------------------
user_id = 1
session_id = str(uuid.uuid4())
thread_id = f"user_{user_id}_session_{session_id}"

print(f"Testing session_id: {session_id}")

# Save a human question
save_message(thread_id, "human", "Tell me about Nigerian tax laws")

# Simulate AI response
save_message(thread_id, "ai", "Nigerian tax laws include personal income tax, VAT, corporate tax, etc.")

# -----------------------------
# 4️⃣ Fetch history
# -----------------------------
history = get_conversation_history(thread_id)

print("\nConversation History:")
for msg in history:
    print(f"[{msg['role']}] {msg['content']}")

# -----------------------------
# 5️⃣ Close DB
# -----------------------------
conn.close()
