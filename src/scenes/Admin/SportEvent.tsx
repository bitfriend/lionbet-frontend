import React, { FunctionComponent, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  TextField,
  makeStyles
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid, #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3)
  }
}));

interface SportEventProps {
  open: boolean;
  onClose: () => void;
}

const SportEvent: FunctionComponent<SportEventProps> = (props: SportEventProps) => {
  const classes = useStyles();
  const { open, onClose } = props;

  const handleTestConnection = useCallback(() => {}, []);

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Create Sport Event</DialogTitle>
      <Box component="form">
        <Button variant="outlined" onClick={handleTestConnection}>Test Connection</Button>
        <TextField
          label="Oracle Address"
          variant="outlined"
        />
      </Box>
    </Dialog>
  );
}

export default SportEvent;
