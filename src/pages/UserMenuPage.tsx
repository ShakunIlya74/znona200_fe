// src/pages/UserMenuPage.tsx
import React from 'react';
import { Container, Box, Typography, List, ListItem, ListItemText, ListItemButton } from '@mui/material';

const UserMenuPage: React.FC = () => {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Main User Menu
        </Typography>
        <List>
          <ListItem>
            <ListItemButton>
            </ListItemButton>
          </ListItem>
          <ListItem component={ListItemButton}>
            <ListItemText primary="Settings" />
          </ListItem>
          <ListItem component={ListItemButton}>
            <ListItemText primary="Dashboard" />
          </ListItem>
          {/* Add more menu items as needed */}
        </List>
      </Box>
    </Container>
  );
};

export default UserMenuPage;
