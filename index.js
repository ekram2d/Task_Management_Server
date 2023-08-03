const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;
const uri =
  'mongodb+srv://taskmanager:4c92FSTTSwHp1Qr1@cluster0.wlwsqet.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const tasksCollection = client.db('TaskManagers').collection('Task');

    app.post('/addtask', async (req, res) => {
      const body = req.body;

      try {
        // Add input validation here (e.g., check for required fields)
        // ...

        const result = await tasksCollection.insertOne(body);
        const insertedTaskId = result.insertedId; // Get the inserted task's _id
        res.json({ success: true, insertedId: insertedTaskId });
      } catch (error) {
        console.error('Error adding task:', error);
        res.status(500).json({ success: false, message: 'Failed to add task' });
      }
    });

    app.get('/gettask', async (req, res) => {
      try {
        const tasks = await tasksCollection.find({}).toArray();
        res.json(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
      }
    });

    app.put('/updatetask/:id', async (req, res) => {
      const taskId = req.params.id;
      const updatedTask = req.body;

      try {
        if (!ObjectId.isValid(taskId)) {
          return res.status(400).json({ success: false, message: 'Invalid taskId' });
        }

        const result = await tasksCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: updatedTask }
        );

        if (result.modifiedCount === 1) {
          res.json({ success: true, message: 'Task updated successfully' });
        } else {
          res.status(404).json({ success: false, message: 'Task not found' });
        }
      } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ success: false, message: 'Failed to update task' });
      }
    });

    app.delete('/deletetask/:id', async (req, res) => {
      const taskId = req.params.id;

      try {
        if (!ObjectId.isValid(taskId)) {
          return res.status(400).json({ success: false, message: 'Invalid taskId' });
        }

        const result = await tasksCollection.deleteOne({ _id: new ObjectId(taskId) });

        if (result.deletedCount === 1) {
          res.json({ success: true, message: 'Task deleted successfully' });
        } else {
          res.status(404).json({ success: false, message: 'Task not found' });
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ success: false, message: 'Failed to delete task' });
      }
    });
  } catch (error) {
    console.error('Error connecting to the database:', error);
  } finally {
    // Ensure that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
