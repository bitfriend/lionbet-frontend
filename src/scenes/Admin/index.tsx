import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';
import {
  AppBar,
  Avatar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Toolbar,
  Typography,
  makeStyles
} from '@material-ui/core';
import { AddCircle, ChevronLeft } from '@material-ui/icons';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { DateTime } from 'luxon';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';

import {
  provider,
  SportKind,
  SportEvent,
  getSportImageUrl,
  getSportType,
  timeToBigNumber,
  bigNumberToTime
} from '../../helpers';
import BetOracle from '../../contracts/BetOracle.json';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  title: {
    flexGrow: 1
  },
  formControl: {
    margin: theme.spacing(1),
    width: '100%',
  },
  backdrop: {
    zIndex: theme.zIndex.modal + 1,
    color: '#fff'
  }
}));

const Admin: FunctionComponent = () => {
  const classes = useStyles();
  const navigate = useNavigate();

  const [sportEvents, setSportEvents] = useState<SportEvent[]>([]);
  const [dislogVisible, setDislogVisible] = useState(false);
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const minDate = DateTime.now().plus({ days: 8 }).toJSDate();
  const [date, setDate] = useState<Date>(minDate);
  const [kind, setKind] = useState<number | unknown>(SportKind.Soccer);
  const [backdropVisible, setBackdropVisible] = useState(false);

  const fetchSportEvents = async () => {
    const betOracle = new ethers.Contract(BetOracle.address, BetOracle.abi, provider);
    const eventIds = await betOracle.getPendingEvents();
    console.log('eventIds', eventIds);
    const result: SportEvent[] = [];
    for (let i = 0; i < eventIds.length; i++) {
      const evt = await betOracle.getEvent(eventIds[i]);
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
      setBackdropVisible(false);
      setDislogVisible(false);
    });
  }, []);

  const handleNew = () => {
    setDislogVisible(true);
    setHomeTeam('France');
    setAwayTeam('England');
    setDate(minDate);
    setKind(SportKind.Soccer);
  };

  const handleClose = () => {
    setDislogVisible(false);
  };

  const handleOk = async () => {
    setBackdropVisible(true);
    const signer = provider.getSigner();
    const betOracle = new ethers.Contract(BetOracle.address, BetOracle.abi, provider);
    const dt = timeToBigNumber(DateTime.fromJSDate(date));
    await betOracle.connect(signer).addSportEvent(
      `${homeTeam} vs. ${awayTeam}`,
      `${homeTeam}|${awayTeam}`,
      2,
      dt,
      kind
    );
    await fetchSportEvents();
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <div className={classes.root}>
        <AppBar position="static">
          <Grid container>
            <Grid item md={2} />
            <Grid item md={8} xs={12}>
              <Toolbar>
                <IconButton color="inherit" onClick={() => navigate(-1)}>
                  <ChevronLeft />
                </IconButton>
                <Typography variant="h6" align="center" className={classes.title}>Admin Dashboard</Typography>
                <IconButton color="inherit" onClick={handleNew}>
                  <AddCircle />
                </IconButton>
              </Toolbar>
            </Grid>
            <Grid item md={2} />
          </Grid>
        </AppBar>
        <Grid container>
          <Grid item md={2} />
          <Grid item md={8} xs={12}>
            <List>
              {sportEvents.map((sportEvent, index) => (
                <Fragment key={index}>
                  <ListItem>
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
              open={dislogVisible}
              onClose={handleClose}
            >
              <DialogTitle>New Sport Event</DialogTitle>
              <DialogContent>
                <Box component="form">
                  <FormControl className={classes.formControl}>
                    <TextField
                      label="Home team"
                      variant="outlined"
                      value={homeTeam}
                      onChange={(evt) => setHomeTeam(evt.target.value)}
                    />
                  </FormControl>
                  <FormControl className={classes.formControl}>
                    <TextField
                      label="Away team"
                      variant="outlined"
                      value={awayTeam}
                      onChange={(evt) => setAwayTeam(evt.target.value)}
                    />
                  </FormControl>
                  <FormControl className={classes.formControl}>
                    <KeyboardDatePicker
                      minDate={minDate}
                      margin="normal"
                      label="Date"
                      format="MM/dd/yyyy"
                      value={date}
                      onChange={(value) => setDate(value || new Date())}
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}
                    />
                  </FormControl>
                  <FormControl className={classes.formControl}>
                    <InputLabel id="demo-simple-select-helper-label">Kind</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={kind}
                      onChange={(e) => setKind(e.target.value)}
                    >
                      <MenuItem value={SportKind.Soccer}>Soccer</MenuItem>
                      <MenuItem value={SportKind.Rugby}>Rugby</MenuItem>
                      <MenuItem value={SportKind.Basketball}>Basketball</MenuItem>
                    </Select>
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
        <Backdrop className={classes.backdrop} open={backdropVisible}>
          <CircularProgress color="inherit" size={64} />
        </Backdrop>
      </div>
    </MuiPickersUtilsProvider>
  );
}

export default Admin;
