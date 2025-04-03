# Neon Chat - Anonymous Real-Time Chat App

A cyberpunk-themed anonymous chat application that allows users to connect via randomly generated room codes. Built with React, Vite, and Supabase for real-time messaging.

## Features

- **Anonymous Chatting**: No sign-up or login required
- **Room Code System**: Connect via paired codes (XXXX-XXXX-XXXX-1 and XXXX-XXXX-XXXX-2)
- **Real-Time Messaging**: Instant message delivery with Supabase
- **Message Persistence**: Option to keep or clear chat history
- **Neon Cyberpunk Design**: Dark theme with purple neon accents
- **Responsive Design**: Works on desktop and mobile browsers

## Future Features

- Media sharing (images, voice messages)
- GIFs and emojis
- Voice and video calling via Railway API

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd neon-chat
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up Supabase
   - Create a new Supabase project
   - Create the following tables:
     - `rooms` table with columns: `id` (uuid, primary key), `room_code` (text), `created_at` (timestamp)
     - `messages` table with columns: `id` (uuid, primary key), `room_code` (text), `content` (text), `sender` (text), `created_at` (timestamp)
   - Enable real-time for the `messages` table

4. Configure environment variables
   - Copy `.env.example` to `.env`
   - Fill in your Supabase URL and anon key

### Running the App

```
npm run dev
```

The app will be available at http://localhost:5173

## Usage

1. **Create a Room**: Click "Generate Room Codes" to create a pair of room codes
2. **Share a Code**: Send one of the codes to your chat partner
3. **Join the Room**: Enter the room by clicking "Enter Chat" or by pasting a code in the join field
4. **Start Chatting**: Messages will appear in real-time
5. **Clear History**: Use the "Clear Chat" button to delete all messages in the room

## Technologies Used

- React with Vite
- React Router for navigation
- Styled Components for styling
- Supabase for real-time database
- UUID for generating unique identifiers
