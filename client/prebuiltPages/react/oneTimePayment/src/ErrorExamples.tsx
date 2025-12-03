import { Component, createContext, useCallback, useContext, useEffect, useState, useReducer, useRef } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
  }

  reload() {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <h1>
          <p>The ErrorBoundary caught an error</p>
          <button onClick={this.reload}>Reload</button>
        </h1>
      );
    }

    return this.props.children; 
  }
}

/**
 * This hook does cause the application to blow up because it bubbles the error up. This setup
 * could be good if you want to use ErrorBoundaries to catch async errors.
 *
 * See here for more info: https://medium.com/trabe/catching-asynchronous-errors-in-react-using-error-boundaries-5e8a5fd7b971%C3%85
 */
const useHookWithSetStateThrownError = () => {
  const [, setErrorState] = useState(null);

  const doThrowError = useCallback(() => {
    setErrorState(() => {
      throw new Error('An error was thrown');
    });
  }, []);

  return {
    doThrowError,
  };
};

/**
 * This hook does not cause the application to blow up because the error is asynchronous. An error
 * boundary will not catch this error because it's asynchronous.
 */
const useHookWithThrownErrorInCallback = () => {
  const doThrowError = useCallback(() => {
    throw new Error('An error was thrown');
  }, []);

  return {
    doThrowError,
  };
};

/**
 * This hook returns an error without throwing it.
 */
const useHookWithErrorReturn = () => {
  const [error, setError] = useState<Error | null>(null);

  const doThrowError = useCallback(() => {
    setError(new Error("An error is returned"));
  }, []);

  return {
    doThrowError,
    error,
  };
};


/**
 * Errors thrown in a non-async useEffect will casue the app to break. These types of
 * errors can be caught by an ErrorBoundary.
 */
const useHookWithEffectError = () => {
  const [doThrow, setDoThrow] = useState(false);

  useEffect(() => {
    if (doThrow) {
      throw new Error("Error thrown from useEffect");
    }
  }, [doThrow]);

  const doThrowError = useCallback(() => {
    setDoThrow(val => !val);
  }, []);

  return {
    doThrowError,
  };
};


/**
 * This feels pretty similar to an error boundary.
 */
const ErrorContext = createContext([null, () => {}]);

/**
 * This hook returns an error without throwing it.
 */
const useErrorContext = () => {
  const [error, setError] = useContext(ErrorContext);

  const doThrowError = useCallback(() => {
    setError(new Error("An error is added to context"));
  }, []);

  return {
    doThrowError,
    error,
  };
};

const ErrorContextButton = () => {
  const {doThrowError, error} = useErrorContext();

  return (
    <div>
      <p>Click the button to add an error to context</p>
      <p style={{color: "red"}}>{error?.message}</p>
      <button onClick={doThrowError}>Add an error to context</button>
    </div>
  );
};

const ErrorContextProvider = () => {
  const [error, setError] = useState(null);

  //const errorContext = useContext(ErrorContext);

  return (
    <ErrorContext value={[
      error,
      setError
    ]}>
        <ErrorContextButton />
    </ErrorContext>
  );
};

const DoSomethingWithErrorReturn = () => {
  const { doThrowError: doThrowErrorReturn, error } = useHookWithErrorReturn();

  // This is the effect merchants would need to rethrow the error
  useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return (
    <div>
      <p>Click button to throw the error returned by the hook.</p>
      <button onClick={doThrowErrorReturn}>Throw error returned by hook</button>
    </div>
  );
};

const ComponentWithHookThrow = () => {
  const { doThrowError: doThrowCallbackError } = useHookWithThrownErrorInCallback();
  const { doThrowError: doThrowSetStateError } = useHookWithSetStateThrownError();
  const { doThrowError: doThrowUseEffectError } = useHookWithEffectError();

  const { doThrowError: doThrowErrorReturn, error } = useHookWithErrorReturn();

  return (
    <div style={{border: "1px solid red", padding: 10}}>
      <div>
        <p>Click the button to throw an error that goes to the console</p>
        <button onClick={doThrowCallbackError}>Throw Error</button>
      </div>
      <div>
        <p>Click the button to throw an error from a setState call which will break the app up to the ErrorBoundary</p>
        <button onClick={doThrowSetStateError}>Throw setState Error</button>
      </div>
      <div>
        <p>Click the button to throw an error and get the error back from the hook return, which can then be displayed</p>
        <p style={{color: "red"}}>{error?.message}</p>
        <button onClick={doThrowErrorReturn}>Throw error returned by hook</button>
      </div>
      <div>
        <p>Click the button to throw an error from a useEffect which will break the app up to the ErrorBoundary</p>
        <button onClick={doThrowUseEffectError}>Throw useEffect Error</button>
      </div>
      <ErrorContextProvider />
      <ErrorBoundary>
        <DoSomethingWithErrorReturn />
      </ErrorBoundary>
    </div>
  );
};

const ComponentWithReducer = () => {
  const renderCount = useRef(1);
  const [state, dispatch] = useReducer((state, action) => {
    if (action.type === "KEEP_STATE") {
      return state;
    } else if (action.type === "CHANGE_STATE") {
      return {
        someState: !state.someState,
      };
    }

    return state;
  }, {
    someState: false,
  });

  useEffect(() => {
    renderCount.current++;
  });

  const onKeepState = useCallback(() => {
    dispatch({ type: "KEEP_STATE" });
  }, []);

  const onChangeState = useCallback(() => {
    dispatch({ type: "CHANGE_STATE" });
  }, []);

  return (
    <div>
      <p>Testing if dispatch causes a rerender when state has not changed</p>
      <div>someState: {String(state.someState)}</div>
      <div>renderCount: {renderCount.current}</div>
      <button onClick={onKeepState}>Keep State</button>
      <button onClick={onChangeState}>Change State</button>
    </div>
  );
};


export const ErrorExamples = () => {
  return (
    <div>
      <p>Here are some diffrent error handling strategies.</p>

      <ErrorBoundary>
        <ComponentWithHookThrow />
      </ErrorBoundary>
      <ComponentWithReducer />
    </div>
  );
};
