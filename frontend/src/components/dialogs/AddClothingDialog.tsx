import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddClothingDialog(props: Props) {
  return <Dialog open={props.open} onClose={props.onClose}>
    <DialogTitle>Add Clothing Item</DialogTitle>
    <DialogContent>
        Drag and drop image here
        
    </DialogContent>
    <DialogActions>

    </DialogActions>
  </Dialog>;
}
