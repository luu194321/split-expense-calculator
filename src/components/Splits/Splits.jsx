import { Card } from "react-bootstrap";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { SplitField } from "../SplitField/SplitField";
import { useSplitDataContext } from "../../store/split-data-context";

import "./styles.scss";
import getSum from "../../utils/getSum";
import { PERCENTAGES, SHARES } from "../../constants";

export const Splits = (props) => {

  const splitState = useSplitDataContext();

  const splitValuesGenerator = () => {
    if (splitState.splitType === PERCENTAGES) {
      return splitState.splits?.map((split) => split.calculatedValue);
    }
    if(splitState.splitType === SHARES){
      return splitState.splits?.map((split)=>split.calculatedValue)
    }
    return splitState.splits?.map((split) => split.value);
  };

  const totalAmountLeftToSplit =
    (splitState.totalAmount - getSum(splitValuesGenerator())).toFixed(2);

  let totalLeftModifier = "";

  if (totalAmountLeftToSplit > 0) {
    totalLeftModifier = "splits__total-left--warning";
  }

  if (totalAmountLeftToSplit < 0) {
    totalLeftModifier = "splits__total-left--danger";
  }

  const handleRemoveFor = (id) => () => {
    const splitType = splitState.splitType;
    splitState.handleRemoveSplit(id, splitType);
  };



  if (!splitState.splits?.length) {
    return (
      <div className="splits">
        <span className="splits__no-splits">
          There are no splits. Add a split to start!
        </span>
      </div>
    );
  }

  return (
    <div className="splits">
      <TransitionGroup className="splits__form">
        {splitState.splits.map((split, index) => (
          <CSSTransition
            key={split.id}
            nodeRef={split.nodeRef}
            timeout={500}
            classNames="splits__split"
          >
            <SplitField
              ref={split.nodeRef}
              position={index + 1}
              splitType={splitState.splitType}
              onRemove={handleRemoveFor(split.id)}
              value={split.value}
              calculatedValue={split.calculatedValue}
              id={split.id}
              name={split.name}
              adjustmentValue={split.adjustmentValue}
            />
          </CSSTransition>
        ))}
      </TransitionGroup>
      <div className="splits__summary">
        <label className="splits__total-label">Total</label>
        <Card className="splits__total-amount">
          ${splitState.splitsTotalAmount}
        </Card>
        <div className={`splits__total-left ${totalLeftModifier}`}>
          {totalAmountLeftToSplit >= 0 && `$${totalAmountLeftToSplit} left`}

          {totalAmountLeftToSplit < 0 &&
            `-$${Math.abs(totalAmountLeftToSplit)} over`}
        </div>
      </div>
    </div>
  );
};
