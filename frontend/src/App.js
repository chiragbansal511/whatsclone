import io from 'socket.io-client'; 

const socket = io('http://localhost:80', {
  transports: ['websocket'],
});
socket.on('message', (data) => {
  console.log('Received message from server:', data);
});

function App() {
  return (
    <div className="App">
    </div>
  );
}

export default App;
