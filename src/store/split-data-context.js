import React, { useReducer, useContext } from "react";
import { EQUALLY, EXACT_AMOUNTS, PERCENTAGES, SHARES } from "../constants";
import { splitReducer, createNewSplit } from "./split-data-reducer";
import fractionStrToDecimal from "../utils/fractionStrToDecimal";

const initialSplits = [createNewSplit()];

const defaultSplitDataState = {
  splitType: EQUALLY,
  splits: initialSplits,
  totalAmount: null,
  totalAmountRemaining: "",
  splitsPerPerson: "",
  splitsTotalAmount: "0",
};
const SplitDataContext = React.createContext(undefined);

export const SplitDataProvider = (props) => {
  const [splitState, dispatchSplitAction] = useReducer(
    splitReducer,
    defaultSplitDataState
  );

  const handleTotalEntered = (amount, splitType) => {
    const total = Number(amount).toFixed(2);

    dispatchSplitAction({ type: "AMOUNT_ENTERED", amount: total, splitType });
  };

  const handleSplitTypeSelect = (splitType) => {
    dispatchSplitAction({ type: "SELECT_TYPE", splitType });
  };

  const handleAddSplit = (splitType) => {
    dispatchSplitAction({ type: "ADD", splitType });
  };

  const handleRemoveSplit = (id, splitType) => {
    dispatchSplitAction({ type: "REMOVE", id, splitType });
  };

  const handleSplitFieldInputChange = (input, splitId) => {
    dispatchSplitAction({ type: "EXACT_INPUT", input, splitId });
  };

  const handleNameChange = (name, splitId) => {
    dispatchSplitAction({ type: "NAME_CHANGE", name, splitId });
  };

  const splitDataContext = {
    splitType: splitState.splitType,
    splits: splitState.splits,
    totalAmount: splitState.totalAmount,
    totalAmountRemaining: splitState.totalAmountRemaining,
    splitsPerPerson: splitState.splitsPerPerson,
    splitsTotalAmount: splitState.splitsTotalAmount,
    handleTotalEntered,
    handleSplitTypeSelect,
    handleAddSplit,
    handleRemoveSplit,
    handleSplitFieldInputChange,
    handleNameChange,
  };
  return (
    <SplitDataContext.Provider value={splitDataContext}>
      {props.children}
    </SplitDataContext.Provider>
  );
};

export const useSplitDataContext = () => {
  const context = useContext(SplitDataContext);

  if (context === undefined) {
    throw new Error(
      "useSplitDataContext must be used within a SplitDataProvider."
    );
  }

  return context;
};
