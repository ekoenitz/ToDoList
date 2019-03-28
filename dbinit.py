import sqlite3
conn = sqlite3.connect('todo.db') # Warning: This file is created in the current directory
conn.execute("CREATE TABLE todo (id INTEGER PRIMARY KEY, task char(100) NOT NULL, duedate char(100) NOT NULL, postdate char(100) NOT NULL, status bool NOT NULL)")
conn.execute("INSERT INTO todo (task,duedate,postdate,status) VALUES ('Read A-byte-of-python to get a good introduction into Python','2018-03-15','2018-03-11',0)")
conn.execute("INSERT INTO todo (task,duedate,postdate,status) VALUES ('Visit the Python website','2018-03-19','2018-03-11',1)")
conn.execute("INSERT INTO todo (task,duedate,postdate,status) VALUES ('Test various editors for and check the syntax highlighting','2018-03-22','2018-03-11',1)")
conn.execute("INSERT INTO todo (task,duedate,postdate,status) VALUES ('Choose your favorite WSGI-Framework','2018-03-30','2018-03-11',0)")
conn.commit()
