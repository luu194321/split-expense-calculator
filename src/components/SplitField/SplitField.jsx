import { forwardRef } from "react";
import { Button, Card, FormControl, InputGroup } from "react-bootstrap";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faPlusMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EQUALLY, EXACT_AMOUNTS, PERCENTAGES, SHARES } from "../../constants";
import { useSplitDataContext } from "../../store/split-data-context";

import "./styles.scss";

export const SplitField = forwardRef((props, ref) => {
  const splitState = useSplitDataContext();

  const withAdjustmentModifier =
    splitState.splitType === "Shares" ? "split-field--with-adjustment" : "";

  const handleRemoveClick = () => {
    props.onRemove();
  };

  const handleChange = (e) => {
    // props.id === id of individual splits
    splitState.handleSplitFieldInputChange(e.target.value, props.id);
  };

  const handleNameChange = (e) => {
    splitState.handleNameChange(e.target.value, props.id);
  };

  const handleAdjustmentFieldInputChange = (e) => {
    splitState.handleAdjustmentFieldInputChange(e.target.value, props.id);
  };

  return (
    <div className={`split-field ${withAdjustmentModifier}`} ref={ref}>
      <div className="split-field__index">{props.position}</div>

      <FormControl
        placeholder="Name"
        className="split-field__name"
        onChange={handleNameChange}
        value={props.name}
      />

      {[EXACT_AMOUNTS, PERCENTAGES, SHARES].includes(splitState.splitType) && (
        <InputGroup className="split-field__input">
          {splitState.splitType === EXACT_AMOUNTS && (
            <InputGroup.Text>$</InputGroup.Text>
          )}

          <FormControl
            onChange={handleChange}
            value={props.value}
            key={props.key}
          />

          {splitState.splitType === PERCENTAGES && (
            <InputGroup.Text>%</InputGroup.Text>
          )}

          {splitState.splitType === SHARES && (
            <InputGroup.Text>share(s)</InputGroup.Text>
          )}
        </InputGroup>
      )}

      {splitState.splitType === SHARES && (
        <InputGroup className="split-field__adjustment">
          <InputGroup.Text className="split-field__adjustment-text">
            <FontAwesomeIcon icon={faPlusMinus} size="2xs" />$
          </InputGroup.Text>

          <FormControl
            placeholder="Adjustment"
            onChange={handleAdjustmentFieldInputChange}
            value={props.adjustmentValue}
          />
        </InputGroup>
      )}

      <Card className="split-field__amount">
        $
        {splitState.splitType === EQUALLY &&
          (splitState.totalAmount === null ? "0" : props.value)}
        {splitState.splitType === EXACT_AMOUNTS && props.value}
        {splitState.splitType === PERCENTAGES && props.calculatedValue}
        {splitState.splitType === SHARES && props.calculatedValue}
      </Card>

      <Button
        variant="link"
        className="split-field__remove"
        onClick={handleRemoveClick}
      >
        <FontAwesomeIcon icon={faTrashCan} />
      </Button>
    </div>
  );
});
