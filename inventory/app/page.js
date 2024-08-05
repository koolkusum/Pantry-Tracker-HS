'use client';
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Container, TextField, Button, List, ListItem, ListItemText, IconButton, Typography, Paper, Box, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
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
  const [filteredItems, setFilteredItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemCount, setItemCount] = useState(1);
  const [itemCategory, setItemCategory] = useState(""); // New state for category
  const [updateId, setUpdateId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortCategory, setSortCategory] = useState(""); // State for sorting by category

  useEffect(() => {
    const fetchItems = async () => {
      if (firestore) {
        const querySnapshot = await getDocs(collection(firestore, "inventory"));
        const items = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return { id: doc.id, ...data, updatedAt: data.updatedAt?.toDate() }; // Convert timestamp to Date
        });
        setPantryItems(items);
        setFilteredItems(items);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    // Filter items based on search query
    let results = pantryItems.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort items based on selected category if sortCategory is set
    if (sortCategory) {
      results = results.filter(item => item.category === sortCategory);
    }
  
    setFilteredItems(results);
  }, [searchQuery, pantryItems, sortCategory]);

  const addItem = async () => {
    if (firestore) {
      const newItem = { name: itemName, count: itemCount, category: itemCategory, updatedAt: serverTimestamp() };
      if (updateId) {
        // Update existing item
        const itemDoc = doc(firestore, "inventory", updateId);
        await updateDoc(itemDoc, newItem);
        // Update local state with new timestamp
        setPantryItems(pantryItems.map(item => item.id === updateId ? { id: updateId, ...newItem, updatedAt: new Date() } : item));
        setUpdateId(null);
      } else {
        // Add new item
        const docRef = await addDoc(collection(firestore, "inventory"), newItem);
        setPantryItems([...pantryItems, { id: docRef.id, ...newItem, updatedAt: new Date() }]);
      }
      setItemName("");
      setItemCount(1);
      setItemCategory(""); // Clear category selection
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
      // Ensure newCount is a number
      const itemDoc = doc(firestore, "inventory", id);
      await updateDoc(itemDoc, { count: Number(newCount), updatedAt: serverTimestamp() });
      setPantryItems(pantryItems.map(item => item.id === id ? { ...item, count: Number(newCount), updatedAt: new Date() } : item));
    }
  };

  // Function to format the timestamp or date
  const formatDate = (date) => {
    if (!date) return '';
    if (date instanceof Date) {
      return date.toLocaleString(); // JavaScript Date
    } else {
      return ''; // Invalid date
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <main>
        <Container>
          <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>Pantry Tracker</Typography>
          <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                sx={{ input: { color: 'white' }, label: { color: 'white' }, flex: 1, border: '1px solid white' }}
                            />
              <TextField
                label="Count"
                type="number"
                value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))} // Convert to number
                sx={{ input: { color: 'white' }, label: { color: 'white' }, flex: 1, border: '1px solid white' }}
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel sx={{ color: 'white' }}>Category</InputLabel>
                <Select
                  value={itemCategory}
                  onChange={(e) => setItemCategory(e.target.value)}
                  sx={{ color: 'white', border: '1px solid white' }}
                  MenuProps={{
                    PaperProps: {
                      sx: { backgroundColor: '#333', color: 'white' }
                    }
                  }}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem value="Fruits">Fruits</MenuItem>
                  <MenuItem value="Vegetables">Vegetables</MenuItem>
                  <MenuItem value="Dairy">Dairy</MenuItem>
                  <MenuItem value="Grains">Grains</MenuItem>
                  <MenuItem value="Meat">Meat</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" color="primary" onClick={addItem}>
                {updateId ? "Update Item" : "Add Item"}
              </Button>
            </Box>
            <TextField
              label="Search Items"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ input: { color: 'white' }, label: { color: 'white' }, border: '1px solid white' }}
            />
            <FormControl sx={{ mb: 2, display: 'flex', flexDirection: 'row', gap: 2 }}>
              <InputLabel sx={{ color: 'white' }}>Sort by Category</InputLabel>
              <Select
                value={sortCategory}
                onChange={(e) => setSortCategory(e.target.value)}
                sx={{ color: 'white', border: '1px solid white' }}
                MenuProps={{
                  PaperProps: {
                    sx: { backgroundColor: '#333', color: 'white' }
                  }
                }}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                <MenuItem value="Fruits">Fruits</MenuItem>
                <MenuItem value="Vegetables">Vegetables</MenuItem>
                <MenuItem value="Dairy">Dairy</MenuItem>
                <MenuItem value="Grains">Grains</MenuItem>
                <MenuItem value="Meat">Meat</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <List>
            {filteredItems.map((item) => (
              <Paper key={item.id} sx={{ mb: 2, p: 2, backgroundColor: '#333', color: 'white' }}>
                <ListItem>
                  <ListItemText 
                    primary={`${item.name} - ${item.count}`}
                    secondary={`Category: ${item.category} | Last Updated: ${formatDate(item.updatedAt)}`}
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
