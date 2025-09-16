-- Create chat_conversations table for storing chat history
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'web_chat',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_activities table for logging user actions
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'web_chat',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a sales chat)
CREATE POLICY "Anyone can insert chat conversations" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view chat conversations" 
ON public.chat_conversations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert user activities" 
ON public.user_activities 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view user activities" 
ON public.user_activities 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_chat_conversations_user_session ON public.chat_conversations(user_id, session_id);
CREATE INDEX idx_chat_conversations_timestamp ON public.chat_conversations(timestamp DESC);
CREATE INDEX idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX idx_user_activities_timestamp ON public.user_activities(timestamp DESC);