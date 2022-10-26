import { createRef } from "react";
import generateUuid from "../utils/generateUuid";
import { EQUALLY, EXACT_AMOUNTS, PERCENTAGES, SHARES } from "../constants";
import currency from "currency.js";
import getSum from "../utils/getSum";

export const createNewSplit = () => ({
  id: generateUuid(),
  name: "",
  nodeRef: createRef(null),
  value: "",
});

const newSplitsforEqually = (totalAmount, splits) => {
  const newSplits = splits.map((split, i) => {
    const newSplitValues = currency(totalAmount).distribute(splits.length);

    return {
      ...split,
      value: newSplitValues[i].value.toFixed(2),
    };
  });
  return newSplits;
};

export const splitReducer = (state, action) => {
  const newSplit = createNewSplit();
  /*-----------------------------------------------------*/
  ////////// SELECT TYPE ///////////////////
  /*-----------------------------------------------------*/
  if (action.type === "SELECT_TYPE") {
    const updatedSplitType = action.splitType;
    console.log(action.splitType);
    console.log(state);
    const newSplitsWithEmptyValues = state.splits.map((split, i) => {
      return {
        ...split,
        value: "",
      };
    });

    if (action.splitType === EQUALLY) {
      if (state.totalAmount === null)
        return { ...state, splitType: action.splitType };

      const newSplits = newSplitsforEqually(state.totalAmount, state.splits);

      const splitValues = newSplits.map((split) => split.value);

      return {
        ...state,
        splitType: updatedSplitType,
        splits: newSplits,
        splitsTotalAmount: getSum(splitValues),
      };
    }
    if (action.splitType !== EQUALLY) {
      console.log(state);
      return {
        ...state,
        splitType: action.splitType,
        splits: newSplitsWithEmptyValues,
        splitsTotalAmount: getSum(newSplitsWithEmptyValues),
      };
    }
    return {
      ...state,
      splitType: action.splitType,
    };
  }
  /*-----------------------------------------------------*/
  ////////// AMOUNT ENTERED //////////////
  /*-----------------------------------------------------*/
  if (action.type === "AMOUNT_ENTERED") {
    if (action.splitType === EQUALLY) {
      if (state.splits.length === 0) {
        return {
          ...state,
          totalAmount: action.amount,
          splitsTotalAmount: action.amount,
        };
      }

      const newSplits = newSplitsforEqually(action.amount, state.splits);
      const splitValues = newSplits.map((split) => split.value);

      return {
        ...state,
        splits: newSplits,
        totalAmount: action.amount,
        splitsTotalAmount: getSum(splitValues),
      };
    }
    return {
      ...state,
      totalAmount: action.amount,
    };
  }
  /*-----------------------------------------------------*/
  ////////// EXACT INPUT ///////////////////
  /*-----------------------------------------------------*/
  if (action.type === "EXACT_INPUT") {
    const inputAmt = action.amount;
    const newSplits = state.splits.map((split, i) => {
      return {
        ...split,
        value: action.splitId === split.id ? inputAmt : split.value,
      };
    });
    // console.log(newSplitsWithValues);
    const splitValues = newSplits.map((split) => split.value);

    return {
      ...state,
      splits: newSplits,
      splitsTotalAmount: getSum(splitValues),
    };
  }

  if (action.type === "NAME_CHANGE") {
    const inputName = action.name;
    const newSplitsWithNames = state.splits.map((split, i) => {
      return {
        ...split,
        name: action.splitId === split.id ? inputName : split.name,
      };
    });

    return {
      ...state,
      splits: newSplitsWithNames,
    };
  }
  /*-----------------------------------------------------*/
  ////////// ADD +++++++++ ///////////////////
  /*-----------------------------------------------------*/
  if (action.type === "ADD") {
    const updatedSplits = state.splits.concat(newSplit);

    if (action.splitType === EQUALLY) {
      if (state.totalAmount != null) {
        const newSplits = newSplitsforEqually(state.totalAmount, updatedSplits);

        const splitValues = newSplits.map((split) => split.value);

        return {
          ...state,
          splits: newSplits,
          splitsTotalAmount: getSum(splitValues),
        };
      }
    }
    return {
      ...state,
      splits: updatedSplits,
    };
  }
  /*-----------------------------------------------------*/
  ////////// REMOVE ------------- ///////////////////
  /*-----------------------------------------------------*/
  if (action.type === "REMOVE") {
    const updatedSplits = state.splits.filter(
      (split) => split.id !== action.id
    );

    if (action.splitType === EQUALLY) {
      if (state.totalAmount === null)
        return { ...state, splits: updatedSplits };

      if (state.totalAmount != null) {
        const newSplits = newSplitsforEqually(state.totalAmount, updatedSplits);
        const splitValues = newSplits.map((split) => split.value);

        return {
          ...state,
          splits: newSplits,
          splitsTotalAmount: getSum(splitValues),
        };
      }
    }

    return {
      ...state,
      splits: updatedSplits,
    };
  }

  return state;
};
