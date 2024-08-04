'use client';
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Container, TextField, Button, List, ListItem, ListItemText, IconButton, Typography, Paper, Box } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ffffff',
    },
    text: {
      primary: '#ffffff',
    },
  },
});

export default function Home() {
  const [pantryItems, setPantryItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemCount, setItemCount] = useState(1);
  const [updateId, setUpdateId] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      if (firestore) {
        const querySnapshot = await getDocs(collection(firestore, "inventory"));
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPantryItems(items);
      }
    };
    fetchItems();
  }, []);

  const addItem = async () => {
    if (firestore) {
      const newItem = { name: itemName, count: itemCount, updatedAt: serverTimestamp() };
      if (updateId) {
        // Update existing item
        const itemDoc = doc(firestore, "inventory", updateId);
        await updateDoc(itemDoc, newItem);
        setPantryItems(pantryItems.map(item => item.id === updateId ? { id: updateId, ...newItem } : item));
        setUpdateId(null);
      } else {
        // Add new item
        const docRef = await addDoc(collection(firestore, "inventory"), newItem);
        setPantryItems([...pantryItems, { id: docRef.id, ...newItem }]);
      }
      setItemName("");
      setItemCount(1);
    }
  };

  const removeItem = async (id) => {
    if (firestore) {
      await deleteDoc(doc(firestore, "inventory", id));
      setPantryItems(pantryItems.filter(item => item.id !== id));
    }
  };

  const updateItemCount = async (id, newCount) => {
    if (firestore) {
      const itemDoc = doc(firestore, "inventory", id);
      await updateDoc(itemDoc, { count: newCount, updatedAt: serverTimestamp() });
      setPantryItems(pantryItems.map(item => item.id === id ? { ...item, count: newCount } : item));
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <main>
        <Container>
          <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>Pantry Tracker</Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              sx={{ input: { color: 'white' }, label: { color: 'white' } }}
            />
            <TextField
              label="Count"
              type="number"
              value={itemCount}
              onChange={(e) => setItemCount(e.target.value)}
              sx={{ input: { color: 'white' }, label: { color: 'white' } }}
            />
            <Button variant="contained" color="primary" onClick={addItem}>
              {updateId ? "Update Item" : "Add Item"}
            </Button>
          </Box>
          <List>
            {pantryItems.map((item) => (
              <Paper key={item.id} sx={{ mb: 2, p: 2, backgroundColor: '#333', color: 'white' }}>
                <ListItem>
                  <ListItemText 
                    primary={`${item.name} - ${item.count}`}
                    secondary={item.updatedAt && item.updatedAt.toDate ? item.updatedAt.toDate().toLocaleString() : "Unknown"}
                    sx={{ color: 'white' }}
                  />
                  <Box>
                    <IconButton aria-label="increase" onClick={() => updateItemCount(item.id, item.count + 1)} sx={{ color: 'white' }}>
                      <AddIcon />
                    </IconButton>
                    <IconButton aria-label="decrease" onClick={() => updateItemCount(item.id, item.count - 1)} sx={{ color: 'white' }}>
                      <RemoveIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => removeItem(item.id)} sx={{ color: 'white' }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              </Paper>
            ))}
          </List>
        </Container>
      </main>
    </ThemeProvider>
  );
}
