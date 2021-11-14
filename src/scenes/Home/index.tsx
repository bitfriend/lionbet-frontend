import React, { FunctionComponent, useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Toolbar,
  Typography,
  makeStyles
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default
  },
  title: {
    flexGrow: 1
  }
}));

interface Bet {
  id: number;
  hometeam: string;
  awayteam: string;
  date: Date;
  type: 'soccer' | 'rugby' | 'basketball';
}

const Home: FunctionComponent = () => {
  const classes = useStyles();

  const bets: Bet[] = [{
    id: 1,
    hometeam: 'PSG',
    awayteam: 'OM',
    date: new Date('2021-04-15'),
    type: 'soccer'
  },{
    id: 2,
    hometeam: 'France',
    awayteam: 'England',
    date: new Date('2021-06-26'),
    type: 'rugby'
  },{
    id: 3,
    hometeam: 'Lakers',
    awayteam: 'Nets',
    date: new Date('2021-12-25'),
    type: 'basketball'
  }];

  const [openBet, setOpenBet] = useState(-1);

  const betTitle = useMemo(() => {
    if (openBet === -1) {
      return 'Bet to undefined';
    }
    return `Bet to ${bets[openBet].type}`;
  }, [openBet]);

  const handleBet = (index: number) => () => {
    setOpenBet(index);
  };
 
  const handleClose = () => {
    setOpenBet(-1);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" align="center" className={classes.title}>Home</Typography>
        </Toolbar>
      </AppBar>
      <Grid container>
        <Grid item md={2} />
        <Grid item md={8} xs={12}>
          {bets.map((bet, index) => (
            <Box key={index} my={2}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Box flex={1}>
                      <Typography variant="h6">{bet.hometeam}</Typography>
                    </Box>
                    <img alt={bet.type} src={`/images/${bet.type}.svg`} width="100px" />
                    <Box flex={1}>
                      <Typography variant="h6">{bet.awayteam}</Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button variant="contained">Count down</Button>
                  <Button variant="contained" color="primary" onClick={handleBet(index)}>Bet</Button>
                </CardActions>
              </Card>
            </Box>
          ))}
          <Dialog
            open={openBet !== -1}
            onClose={handleClose}
          >
            <DialogTitle>{betTitle}</DialogTitle>
            <DialogContent>
              <Box component="form">
                <TextField
                  label="Amount"
                  variant="outlined"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </Dialog>
        </Grid>
        <Grid item md={2} />
      </Grid>
    </div>
  );
}

export default Home;
