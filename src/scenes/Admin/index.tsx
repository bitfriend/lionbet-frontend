import React, { FunctionComponent } from 'react';
import {
  AppBar,
  Grid,
  Toolbar,
  Typography,
  makeStyles
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  title: {
    flexGrow: 1
  }
}));

const Admin: FunctionComponent = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" align="center" className={classes.title}>Admin Dashboard</Typography>
        </Toolbar>
      </AppBar>
      <Grid container>
        <Grid item md={2} />
        <Grid item md={8} xs={12}></Grid>
        <Grid item md={2} />
      </Grid>
    </div>
  );
}

export default Admin;
