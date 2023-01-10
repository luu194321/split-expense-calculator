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
  calculatedValue: "",
  adjustmentValue: "",
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

const newSplitsForShares = (updatedSplits, totalAmount) => {
  const totalShares = updatedSplits.reduce((acc, split, i) => {
    return (acc += +split.value);
  }, 0);

  const adjustmentInputTotal = updatedSplits.reduce((acc, split, i) => {
    return (acc += +split.adjustmentValue);
  }, 0);

  const totalAmountAfterAdjustments = totalAmount - adjustmentInputTotal;

  const distributedCalculatedValues = currency(
    totalAmountAfterAdjustments
  ).distribute(totalShares);

  const splits = updatedSplits.map((split) => {
    const calculatedValues = distributedCalculatedValues.splice(0, split.value);

    return {
      ...split,
      calculatedValue: (
        +getSum(calculatedValues) + +split.adjustmentValue
      ).toFixed(2),
    };
  });

  const splitsTotalAmount = getSum(
    splits.map((split) => split.calculatedValue)
  );

  return { splits, splitsTotalAmount };
};

export const splitReducer = (state, action) => {

  const newSplit = createNewSplit();

  /*-----------------------------------------------------*/
  ////////// SELECT TYPE ///////////////////
  /*-----------------------------------------------------*/
  if (action.type === "SELECT_TYPE") {
    const newSplitsWithEmptyValues = state.splits.map((split, i) => {
      return {
        ...split,
        value: "",
        calculatedValue: "",
        adjustmentValue: "",
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
        splitType: action.splitType,
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
    const isInvalidNumber =
      isNaN(Number(action.amount)) && action.amount !== ".";
    const hasMoreThanTwoDecimals =
      action.amount.includes(".") && action.amount.split(".")[1].length > 2;

    if (isInvalidNumber || hasMoreThanTwoDecimals) return state;

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
          calculatedValue: ((split.value * action.amount) / 100).toFixed(2),
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

    ////-----  SHARES ------////

    if (action.splitType === SHARES) {
      const updatedSharesData = newSplitsForShares(state.splits, action.amount);

      return {
        ...state,
        totalAmount: action.amount,
        splits: updatedSharesData.splits,
        splitsTotalAmount: updatedSharesData.splitsTotalAmount,
      };
    }

    return {
      ...state,
      totalAmount: action.amount,
    };
  }
  /*-----------------------------------------------------*/
  ////////// INPUT CHANGE ///////////////////
  /*-----------------------------------------------------*/
  if (action.type === "INPUT_CHANGE") {
    if (isNaN(Number(action.input)) && action.input !== ".") return state;

    if (state.splitType === EXACT_AMOUNTS) {
      if (action.input.includes(".") && action.input.split(".")[1].length > 2) {
        return state;
      }
    }

    const newSplits = state.splits.map((split, i) => {
      return {
        ...split,
        value: action.splitId === split.id ? action.input : split.value,
      };
    });

    const splitValues = newSplits.map((split) => split.value);

    ////-----  PERCENTAGES ------////

    if (state.splitType === PERCENTAGES) {
      if (action.input === ".") {
        return { ...state, splits: newSplits };
      }

      const newPercentagesSplits = state.splits.map((split, i) => {
        return {
          ...split,
          value: action.splitId === split.id ? action.input : split.value,
          calculatedValue:
            action.splitId === split.id
              ? ((Number(action.input) * state.totalAmount) / 100).toFixed(2)
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

    ////-----  SHARES ------////

    if (state.splitType === SHARES) {
      if (action.input === ".") {
        console.log('error')

        return {...state,splits:newSplits}
      }
      
      const updatedSharesData = newSplitsForShares(
        newSplits,
        state.totalAmount
      );

      return {
        ...state,
        splits: updatedSharesData.splits,
        splitsTotalAmount: updatedSharesData.splitsTotalAmount,
      };
    }

    return {
      ...state,
      splits: newSplits,
      splitsTotalAmount: getSum(splitValues),
    };
  }

  /*-----------------------------------------------------*/
  ////////// ADJUSTMENT FIELD INPUT CHANGE ///////////////////
  /*-----------------------------------------------------*/

  if (action.type === "ADJUSTMENT_INPUT") {
    const isInvalidNumber = isNaN(Number(action.input)) && action.input !== ".";
    const hasMoreThanTwoDecimals =
      action.input.includes(".") && action.input.split(".")[1].length > 2;
    console.log(
      "isinvalid:",
      isInvalidNumber,
      "hasmmoredec",
      hasMoreThanTwoDecimals
    );

    if (isInvalidNumber || hasMoreThanTwoDecimals) return state;

    const newSplits = state.splits.map((split) => {
      return {
        ...split,
        adjustmentValue:
          action.splitId === split.id ? action.input : split.adjustmentValue,
      };
    });

    if (action.input === ".") {
      return { ...state, splits: newSplits };
    }

    const updatedSharesData = newSplitsForShares(newSplits, state.totalAmount);

    return {
      ...state,
      splits: updatedSharesData.splits,
      splitsTotalAmount: updatedSharesData.splitsTotalAmount,
    };
  }

  /*-----------------------------------------------------*/
  ////////// NAME CHANGE ///////////////////
  /*-----------------------------------------------------*/

  if (action.type === "NAME_CHANGE") {

    const splitsWithUpdatedNames = state.splits.map((split, i) => {
      return {
        ...split,
        name: action.splitId === split.id ? action.name : split.name,
      };
    });

    return {
      ...state,
      splits: splitsWithUpdatedNames,
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
    ////-----  EQUALLY  ------////

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
    ////-----  PERCENTAGES  ------////

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
    ////-----  SHARES  ------////

    if (action.splitType === SHARES) {
      const updatedSharesData = newSplitsForShares(
        updatedSplits,
        state.totalAmount
      );

      return {
        ...state,
        splits: updatedSharesData.splits,
        splitsTotalAmount: updatedSharesData.splitsTotalAmount,
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
