import React, { ChangeEvent, Fragment, FunctionComponent, useEffect, useMemo, useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Radio,
  RadioGroup,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

import {
  provider,
  SportEvent,
  getSportImageUrl,
  getSportType,
  bigNumberToTime
} from '../helpers';

import Bet from '../contracts/Bet.json';
import BetOracle from '../contracts/BetOracle.json';

const Home: FunctionComponent = () => {
  const navigate = useNavigate();

  const [sportEvents, setSportEvents] = useState<SportEvent[]>([]);
  const [currentGame, setCurrentGame] = useState(-1);
  const [chosenWinner, setChosenWinner] = useState("");
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
    const onFetch = () => {
      fetchSportEvents();
    };
    // subscribe
    provider.on(filter, onFetch);

    // unsubscribe
    return () => {
      provider.removeListener(filter, onFetch);
    };
  }, []);

  const title = useMemo(() => {
    if (currentGame === -1) {
      return 'Bet to undefined';
    }
    return `Bet to ${sportEvents[currentGame].name}`;
  }, [sportEvents, currentGame]);

  const homeTeam = useMemo(() => {
    if (currentGame === -1) {
      return '';
    }
    return sportEvents[currentGame].name.split(' vs. ')[0];
  }, [currentGame, sportEvents]);

  const awayTeam = useMemo(() => {
    if (currentGame === -1) {
      return '';
    }
    return sportEvents[currentGame].name.split(' vs. ')[1];
  }, [currentGame, sportEvents]);

  const handleClick = (index: number) => {
    console.log('current index', index);
    setCurrentGame(index);
    setChosenWinner("");
    setAmount("");
  };

  const handleClose = () => {
    setCurrentGame(-1);
  };

  const handleChoose = (e: ChangeEvent<HTMLInputElement>, value: string) => {
    setChosenWinner(value);
  }

  const handleOk = async () => {
    const signer = provider.getSigner();
    const bet = new ethers.Contract(Bet.address, Bet.abi, provider);
    // const approveTx = await bet.connect(signer).approve(signer.getAddress(), ethers.utils.parseEther(amount));
    // await approveTx.wait();
    const tx = await bet.connect(signer).placeBet(
      sportEvents[currentGame].id,
      parseInt(chosenWinner),
      {
        from: signer.getAddress(),
        value: ethers.utils.parseEther(amount)
      }
    );
    await tx.wait();
  };

  return (
    <Box flexGrow={1} sx={{ bgcolor: 'background.default' }}>
      <AppBar position="static">
        <Grid container>
          <Grid item md={2} />
          <Grid item md={8} xs={12}>
            <Toolbar>
              <Typography variant="h6" align="center" sx={{ flexGrow: 1 }}>Home</Typography>
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
          <List sx={{ mx: 0, my: 1, width: '100%', backgroundColor: 'background.paper' }}>
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
                <FormControl sx={{ m: 1, width: '100%' }}>
                  <FormLabel component="legend">Who is preferred</FormLabel>
                  <RadioGroup row value={chosenWinner} onChange={handleChoose}>
                    <FormControlLabel value="0" control={<Radio />} label={homeTeam} />
                    <FormControlLabel value="1" control={<Radio />} label={awayTeam} />
                  </RadioGroup>
                </FormControl>
                <FormControl sx={{ m: 1, width: '100%' }}>
                  <TextField
                    label="Amount"
                    variant="outlined"
                    value={amount}
                    onChange={(evt) => setAmount(evt.target.value)}
                  />
                </FormControl>
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
    </Box>
  );
}

export default Home;
