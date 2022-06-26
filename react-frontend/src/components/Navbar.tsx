// @flow 
import { AppBar, IconButton, Toolbar, Typography } from '@material-ui/core';
import { DriveEta } from '@mui/icons-material';
import * as React from 'react';

export const Navbar: React.FunctionComponent = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu">
                    <DriveEta />
                </IconButton>
                <Typography variant="h6">Code Delivery</Typography>
            </Toolbar>
        </AppBar>
    );
};