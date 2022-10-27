import { createRef } from "react";
import generateUuid from "../utils/generateUuid";
import { EQUALLY, EXACT_AMOUNTS, PERCENTAGES, SHARES } from "../constants";
import currency from "currency.js";
import getSum from "../utils/getSum";
import fractionStrToDecimal from "../utils/fractionStrToDecimal";

export const createNewSplit = () => ({
  id: generateUuid(),
  name: "",
  nodeRef: createRef(null),
  value: "",
  calculatedValue: "",
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
        calculatedValue: "",
      };
    });
    ////-----  EQUALLY ------////
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

    return {
      ...state,
      splitType: action.splitType,
      splits: newSplitsWithEmptyValues,
      splitsTotalAmount: getSum(newSplitsWithEmptyValues),
    };
  }
  /*-----------------------------------------------------*/
  ////////// AMOUNT ENTERED //////////////
  /*-----------------------------------------------------*/
  if (action.type === "AMOUNT_ENTERED") {
    ////-----  EQUALLY ------////

    if (action.splitType === EQUALLY) {
      const newSplits = newSplitsforEqually(action.amount, state.splits);
      const splitValues = newSplits.map((split) => split.value);

      if (state.splits.length === 0) {
        return {
          ...state,
          totalAmount: action.amount,
          splitsTotalAmount: action.amount,
        };
      }
      return {
        ...state,
        splits: newSplits,
        totalAmount: action.amount,
        splitsTotalAmount: getSum(splitValues),
      };
    }

    ////-----  PERCENTAGES ------////

    if (action.splitType === PERCENTAGES) {
      const newPercentagesSplits = state.splits.map((split, i) => {
        console.log(split.value[i]);
        return {
          ...split,
          calculatedValue: (split.value * action.amount) / 100,
        };
      });

      const percentagesSplitValues = newPercentagesSplits.map(
        (split) => split.calculatedValue
      );

      return {
        ...state,
        splits: newPercentagesSplits,
        totalAmount: action.amount,
        splitsTotalAmount: getSum(percentagesSplitValues),
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
    const newSplits = state.splits.map((split, i) => {
      return {
        ...split,
        value: action.splitId === split.id ? action.input : split.value,
      };
    });

    const splitValues = newSplits.map((split) => split.value);

    ////-----  PERCENTAGES ------////

    if (state.splitType === PERCENTAGES) {
      const newPercentagesSplits = state.splits.map((split, i) => {
        console.log(Number(action.input) * state.totalAmount);
        return {
          ...split,
          value: action.splitId === split.id ? action.input : split.value,
          calculatedValue:
            action.splitId === split.id
              ? (Number(action.input) * state.totalAmount) / 100
              : split.calculatedValue,
        };
      });

      const percentagesSplitValues = newPercentagesSplits.map(
        (split) => split.calculatedValue
      );

      return {
        ...state,
        splits: newPercentagesSplits,
        splitsTotalAmount: getSum(percentagesSplitValues),
      };
    }

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
  ///////////// ADD +++++++++ ///////////////////
  /*-----------------------------------------------------*/
  if (action.type === "ADD") {
    const updatedSplits = state.splits.concat(newSplit);
    ////-----  EQUALLY ------////
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

    const splitValues = updatedSplits.map((split) => split.value);

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

    if (action.splitType === PERCENTAGES) {
      const percentagesSplitValues = updatedSplits.map(
        (split) => split.calculatedValue
      );

      return {
        ...state,
        splits: updatedSplits,
        splitsTotalAmount: getSum(percentagesSplitValues),
      };
    }

    return {
      ...state,
      splits: updatedSplits,
      splitsTotalAmount: getSum(splitValues),
    };
  }

  return state;
};
