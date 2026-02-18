# AgentViz v2

Real-time WebSocket-based dashboard for visualizing OpenClaw agent activity.

## Features

- **Live Agent Status**: See which agents are running, idle, or have errors
- **Activity Feed**: Real-time stream of tool calls and completions
- **Token Usage**: Visual bar chart of token consumption per agent
- **Model Tracking**: Monitor which LLM model each agent is using
- **Connection Health**: WebSocket connection status with auto-reconnect

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Express 5 + WebSocket (ws library)
- **Icons**: Lucide React
- **Design**: Custom dark theme with CSS variables

## Prerequisites

- Node.js 18+
- npm or yarn
- OpenClaw gateway running on ws://127.0.0.1:18789 (or configure via GATEWAY_WS_URL)

## Installation

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at http://localhost:3503

## Build & Production

Build both client and server:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

Or run the server directly with TypeScript:

```bash
npm run server
```

## Environment Variables

Create a `.env` file (see `.env.example`):

```bash
# Client configuration
VITE_WS_URL=ws://127.0.0.1:3503/ws
VITE_PORT=3503
VITE_MOCK_WS=false

# Server configuration
PORT=3503
GATEWAY_WS_URL=ws://127.0.0.1:18789
```

## WebSocket Events

The dashboard listens for these event types from the gateway:

- `agent_started` - Agent started with name and model
- `agent_ended` - Agent completed
- `tool_called` - Tool execution started
- `tool_completed` - Tool execution finished
- `model_switched` - LLM model changed
- `token_update` - Token usage updated
- `heartbeat` - Agent status heartbeat

## Testing

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test:watch
```

Run type checking:

```bash
npm run typecheck
```

## Deployment

### Systemd Service

Copy the service file to your user services directory:

```bash
cp agent-viz-v2.service ~/.config/systemd/user/
```

Start and enable the service:

```bash
systemctl --user daemon-reload
systemctl --user enable agent-viz-v2.service
systemctl --user start agent-viz-v2.service
```

### Nginx Reverse Proxy

Copy the nginx config:

```bash
sudo cp nginx/agent-viz-v2.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/agent-viz-v2.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Make sure you have SSL certificates at:
- `/etc/nginx/ssl/origin.crt`
- `/etc/nginx/ssl/origin.key`

## License

MIT
