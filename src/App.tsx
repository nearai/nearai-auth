import '@near-pagoda/ui/styles.css';
import './main.css';

import { PagodaUiProvider, Toaster } from '@near-pagoda/ui';

import { Login } from './Login';

function App() {
  const useRouter = () => {
    return {
      push: (path: string) => history.pushState({}, '', path),
      prefetch: () => {},
    };
  };

  return (
    <PagodaUiProvider
      value={{
        Link: (props) => <a {...props} />,
        useRouter,
      }}
    >
      <Toaster />
      <Login />
    </PagodaUiProvider>
  );
}

export default App;
