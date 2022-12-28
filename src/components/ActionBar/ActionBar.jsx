import { Button, Card, FormControl, InputGroup } from "react-bootstrap";
import { SplitTypeField } from "../SplitTypeField";
import { useSplitDataContext } from "../../store/split-data-context";

import "./styles.scss";

export const ActionBar = (props) => {

  const splitState = useSplitDataContext();

  const handleAddClick = () => {
    splitState.handleAddSplit(splitState.splitType);
  };

  const handleChange = (e) => {
    splitState.handleTotalEntered(e.target.value, splitState.splitType);
  };

  return (
    <Card className="action-bar">
      <div className="total-expense">
        <label className="total-expense__label">Total expense</label>
        <InputGroup className="total-expense__input">
          <InputGroup.Text>$</InputGroup.Text>
          <FormControl value={splitState.totalAmount} onChange={handleChange} />
        </InputGroup>
      </div>

      <div className="action-bar__divider" />

      <SplitTypeField className="action-bar__split-type-field" />

      <div className="action-bar__divider" />

      <div className="action-bar__add-split">
        <Button onClick={handleAddClick}>Add split</Button>
      </div>
    </Card>
  );
};
