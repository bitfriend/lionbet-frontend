import React, { Fragment, FunctionComponent, useEffect, useMemo, useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
  makeStyles
} from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

import {
  provider,
  SportKind,
  SportEvent,
  getSportImageUrl,
  getSportType,
  requestAccount,
  bigNumberToTime
} from '../../helpers';

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
  },
  list: {
    margin: theme.spacing(1, 0),
    width: '100%',
    backgroundColor: theme.palette.background.paper
  }
}));

const Home: FunctionComponent = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [sportEvents, setSportEvents] = useState<SportEvent[]>([]);
  const [currentGame, setCurrentGame] = useState(-1);
  const [amount, setAmount] = useState("");

  const fetchSportEvents = async () => {
    const bet = new ethers.Contract(Bet.address, Bet.abi, provider);
    const eventIds = await bet.getBettableEvents();
    console.log('eventIds', eventIds);
    const result: SportEvent[] = [];
    for (let i = 0; i < eventIds.length; i++) {
      const evt = await bet.getEvent(eventIds[i]);
      result.push({
        id: evt.id,
        name: evt.name,
        participants: evt.participants,
        participantCount: evt.participantCount,
        date: evt.date,
        kind: evt.kind
      });
    }
    console.log('result', result);
    setSportEvents(result);
  };

  useEffect(() => {
    fetchSportEvents();

    const filter = {
      address: BetOracle.address,
      topics: [
        ethers.utils.id('SportEventAdded(bytes32,string,string,uint8,uint256,uint8,uint8,int8)')
      ]
    };
    provider.on(filter, () => {
      fetchSportEvents();
    });
  }, []);

  const title = useMemo(() => {
    if (currentGame === -1) {
      return 'Bet to undefined';
    }
    return `Bet to ${sportEvents[currentGame].name}`;
  }, [sportEvents, currentGame]);

  const handleClick = (index: number) => {
    console.log('current index', index);
    setCurrentGame(index);
  };

  const handleClose = () => {
    setCurrentGame(-1);
  };

  const handleOk = async () => {
    const signer = provider.getSigner();
    const bet = new ethers.Contract(Bet.address, Bet.abi, provider);
    // const approveTx = await bet.connect(signer).approve(signer.getAddress(), ethers.utils.parseEther(amount));
    // await approveTx.wait();
    const tx = await bet.connect(signer).placeBet(sportEvents[currentGame].id, 1, {
      from: signer.getAddress(),
      value: ethers.utils.parseEther("0.01")
    });
    await tx.wait();
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
          <List className={classes.list}>
            {sportEvents.map((sportEvent, index) => (
              <Fragment key={index}>
                <ListItem button onClick={() => handleClick(index)}>
                  <ListItemAvatar>
                    <Avatar alt={sportEvent.name} src={getSportImageUrl(sportEvent.kind)} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={sportEvent.name}
                    secondary={(
                      <Fragment>
                        <Typography component="span" display="block">{getSportType(sportEvent.kind)}</Typography>
                        <Typography component="span" display="block">{bigNumberToTime(sportEvent.date).toFormat('LLL dd, yyyy')}</Typography>
                      </Fragment>
                    )}
                  />
                </ListItem>
                {(index < sportEvents.length - 1) && (
                  <Divider variant="inset" component="li" />
                )}
              </Fragment>
            ))}
          </List>
          <Dialog
            open={currentGame !== -1}
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
