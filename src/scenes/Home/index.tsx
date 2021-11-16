import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
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
  IconButton,
  TextField,
  Toolbar,
  Typography,
  makeStyles
} from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

import { provider, requestAccount } from '../../helpers';

import DAI from '../../contracts/DAI.json';
import Bet from '../../contracts/Bet.json';
import BetOracle from '../../contracts/BetOracle.json';
import DefiPool from '../../contracts/DefiPool.json';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default
  },
  title: {
    flexGrow: 1
  }
}));

interface Game {
  id: number;
  hometeam: string;
  awayteam: string;
  date: Date;
  type: 'soccer' | 'rugby' | 'basketball';
}

const Home: FunctionComponent = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const games: Game[] = [{
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

  const [openGame, setOpenGame] = useState(-1);
  const [amount, setAmount] = useState("");

  const title = useMemo(() => {
    if (openGame === -1) {
      return 'Bet to undefined';
    }
    return `Bet to ${games[openGame].type}`;
  }, [openGame]);

  const handleOpen = (index: number) => () => {
    setOpenGame(index);
  };
 
  const handleClose = () => {
    setOpenGame(-1);
  };

  const handleOk = async () => {
    const signer = provider.getSigner();
    const bet = new ethers.Contract(Bet.address, Bet.abi, provider);
    const approveTx = await bet.connect(signer).approve(signer.getAddress(), ethers.utils.parseEther(amount));
    await approveTx.wait();
    const depositTx = await bet.connect(signer).deposit(signer.getAddress(), ethers.utils.parseEther(amount));
    await depositTx.wait();
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Grid container>
          <Grid item md={2} />
          <Grid item md={8} xs={12}>
            <Toolbar>
              <Typography variant="h6" align="center" className={classes.title}>Home</Typography>
              <IconButton color="inherit" onClick={() => navigate('/admin')}>
                <AccountCircle />
              </IconButton>
            </Toolbar>
          </Grid>
          <Grid item md={2} />
        </Grid>
      </AppBar>
      <Grid container>
        <Grid item md={2} />
        <Grid item md={8} xs={12}>
          {games.map((game, index) => (
            <Box key={index} my={2}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Box flex={1}>
                      <Typography variant="h6">{game.hometeam}</Typography>
                    </Box>
                    <img alt={game.type} src={`/images/${game.type}.svg`} width="64px" />
                    <Box flex={1}>
                      <Typography variant="h6">{game.awayteam}</Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button variant="contained">Count down</Button>
                  <Button variant="contained" color="primary" onClick={handleOpen(index)}>Bet</Button>
                </CardActions>
              </Card>
            </Box>
          ))}
          <Dialog
            open={openGame !== -1}
            onClose={handleClose}
          >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
              <Box component="form">
                <TextField
                  label="Amount"
                  variant="outlined"
                  value={amount}
                  onChange={(evt) => setAmount(evt.target.value)}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
              <Button onClick={handleOk}>OK</Button>
            </DialogActions>
          </Dialog>
        </Grid>
        <Grid item md={2} />
      </Grid>
    </div>
  );
}

export default Home;
