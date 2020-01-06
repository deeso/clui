import { useReducer, useMemo, useCallback } from 'react';
import { ICommands } from './types';
import { inputState, IInputState } from './state';

interface IState extends Omit<IInputState, 'update' | 'run'> {
  input: IInputState;
  run?: IInputState['run'];
}

type Action = {
  type: 'UPDATE';
  updates: Partial<{ value: string; index: number }>;
};

const reducer = (state: IState, action: Action) => {
  switch (action.type) {
    case 'UPDATE':
      state.input.update(action.updates);

      return {
        ...state,
        ...action.updates,
        runnable: state.input.runnable,
        exhausted: state.input.exhausted,
        suggestions: state.input.suggestions,
        run: state.input.run,
      };
    default:
      return state;
  }
};

interface IUpdates {
  index?: number;
  value?: string;
}

interface IOptions {
  commands: ICommands;
  value?: string;
  index?: number;
}

const useInputState = (
  options: IOptions,
): [Omit<IState, 'input' | 'update'>, (updates: Action['updates']) => void] => {
  const input = useMemo(() => inputState(options.commands), [options.commands]);
  const value = options.value || '';

  const [state, dispatch] = useReducer(reducer, {
    value,
    input,
    index: options.index !== undefined ? options.index : value.length,
    suggestions: input.suggestions,
    runnable: input.runnable,
    exhausted: input.exhausted,
  });

  const update = useCallback((updates: IUpdates) => dispatch({ type: 'UPDATE', updates }), [
    dispatch,
  ]);

  return [
    {
      value: state.value,
      index: state.index,
      suggestions: state.suggestions,
      runnable: state.runnable,
      exhausted: state.exhausted,
      run: state.run,
    },
    update,
  ];
};

export default useInputState;
