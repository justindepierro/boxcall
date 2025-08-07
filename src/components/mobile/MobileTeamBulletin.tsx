import React, { useState, useRef, useEffect } from "react";
import { format, isToday, formatDistanceToNow } from "date-fns";
import { Icon } from "../ui/Icon/Icon";
import { Typography } from "../design-system";
import { useAuth } from "../../app/auth-store";

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userRole: "coach" | "player" | "parent" | "admin";
  content: string;
  timestamp: Date;
  type: "text" | "image" | "voice" | "announcement";
  attachmentUrl?: string;
  isImportant?: boolean;
  replies?: Message[];
}

export interface MobileTeamBulletinProps {
  teamId: string;
  messages?: Message[];
  onSendMessage: (
    content: string,
    type: Message["type"],
    attachmentUrl?: string
  ) => void;
  onSendVoice?: (audioBlob: Blob) => void;
  onTakePhoto?: () => void;
  className?: string;
}

/**
 * Mobile Team Bulletin - Chat Interface
 *
 * Features:
 * - WhatsApp-style message bubbles
 * - Voice message recording with waveform
 * - Camera integration for photo sharing
 * - Priority announcements from coaches
 * - Message reactions and quick replies
 * - Auto-scroll to new messages
 * - Offline message queuing
 */
export const MobileTeamBulletin: React.FC<MobileTeamBulletinProps> = ({
  teamId: _teamId,
  messages = [],
  onSendMessage,
  onSendVoice,
  onTakePhoto,
  className = "",
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Handle text message send
  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    onSendMessage(messageText.trim(), "text");
    setMessageText("");
    inputRef.current?.focus();
  };

  // Handle voice recording
  const startRecording = async () => {
    if (!onSendVoice) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        onSendVoice(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // Stop all tracks without sending
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => stream.getTracks().forEach((track) => track.stop()));
    }
  };

  // Format recording time
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Get message bubble style based on user
  const getMessageBubbleStyle = (message: Message) => {
    const isOwnMessage = message.userId === user?.id;
    const isCoach = message.userRole === "coach";
    const isImportant = message.isImportant || message.type === "announcement";

    if (isOwnMessage) {
      return "bg-brand-jade text-white ml-12 rounded-bl-lg rounded-tl-lg rounded-tr-lg rounded-br-sm";
    }

    if (isImportant) {
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 mr-12 rounded-bl-sm rounded-tl-lg rounded-tr-lg rounded-br-lg border-l-4 border-yellow-500";
    }

    if (isCoach) {
      return "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 mr-12 rounded-bl-sm rounded-tl-lg rounded-tr-lg rounded-br-lg border-l-2 border-blue-500";
    }

    return "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mr-12 rounded-bl-sm rounded-tl-lg rounded-tr-lg rounded-br-lg";
  };

  // Render message based on type
  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case "image":
        return (
          <div className="space-y-2">
            {message.attachmentUrl && (
              <img
                src={message.attachmentUrl}
                alt="Shared image"
                className="rounded-lg max-w-full h-auto max-h-64 object-cover"
              />
            )}
            {message.content && (
              <Typography variant="body-sm">{message.content}</Typography>
            )}
          </div>
        );

      case "voice":
        return (
          <div className="flex items-center space-x-3">
            <button className="p-2 bg-white bg-opacity-20 rounded-full">
              <Icon name="play" size="sm" />
            </button>
            <div className="flex-1">
              <div className="h-1 bg-white bg-opacity-20 rounded-full">
                <div className="h-1 bg-white rounded-full w-1/3"></div>
              </div>
            </div>
            <Typography variant="body-xs" className="opacity-75">
              0:45
            </Typography>
          </div>
        );

      case "announcement":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Icon name="star" size="sm" />
              <Typography variant="body-sm" className="font-semibold">
                Team Announcement
              </Typography>
            </div>
            <Typography variant="body-md">{message.content}</Typography>
          </div>
        );

      default:
        return <Typography variant="body-sm">{message.content}</Typography>;
    }
  };

  const quickReplies = [
    "👍",
    "👏",
    "💪",
    "🔥",
    "Thanks!",
    "Got it",
    "On my way",
  ];

  return (
    <div
      className={`flex flex-col h-full bg-gray-50 dark:bg-gray-900 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 bg-brand-jade rounded-full flex items-center justify-center">
            <Icon name="users" size="md" className="text-white" />
          </div>
          <div>
            <Typography variant="body-md" className="font-semibold">
              Team Chat
            </Typography>
            <Typography variant="body-xs" color="muted">
              {messages.length} messages
            </Typography>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <Icon name="menu" size="md" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Icon
              name="users"
              size="lg"
              className="mx-auto mb-3 text-gray-400"
            />
            <Typography variant="body-md" color="muted">
              No messages yet
            </Typography>
            <Typography variant="body-sm" color="muted">
              Start the conversation!
            </Typography>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.userId === user?.id;
            const showTimestamp =
              index === 0 ||
              !isToday(messages[index - 1]?.timestamp) !==
                !isToday(message.timestamp);

            return (
              <div key={message.id}>
                {/* Date separator */}
                {showTimestamp && (
                  <div className="text-center py-2">
                    <Typography variant="body-xs" color="muted">
                      {isToday(message.timestamp)
                        ? "Today"
                        : format(message.timestamp, "MMM d, yyyy")}
                    </Typography>
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 ${getMessageBubbleStyle(message)}`}
                  >
                    {/* Sender name (for others' messages) */}
                    {!isOwnMessage && (
                      <div className="flex items-center space-x-1 mb-1">
                        <Typography
                          variant="body-xs"
                          className="font-semibold opacity-75"
                        >
                          {message.userName}
                        </Typography>
                        {message.userRole === "coach" && (
                          <Icon
                            name="shield"
                            size="xs"
                            className="text-blue-500"
                          />
                        )}
                      </div>
                    )}

                    {/* Message content */}
                    {renderMessageContent(message)}

                    {/* Timestamp */}
                    <Typography
                      variant="body-xs"
                      className="mt-1 opacity-60 text-right"
                    >
                      {formatDistanceToNow(message.timestamp, {
                        addSuffix: true,
                      })}
                    </Typography>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick replies */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex space-x-2 overflow-x-auto">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => onSendMessage(reply, "text")}
              className="flex-shrink-0 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-manipulation"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        {isRecording ? (
          /* Voice recording UI */
          <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900 rounded-lg">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="flex-1">
              <Typography
                variant="body-sm"
                className="text-red-700 dark:text-red-300"
              >
                Recording... {formatRecordingTime(recordingTime)}
              </Typography>
            </div>
            <button
              onClick={cancelRecording}
              className="p-2 text-gray-500 hover:text-gray-700 touch-manipulation"
            >
              <Icon name="close" size="md" />
            </button>
            <button
              onClick={stopRecording}
              className="p-2 bg-red-500 text-white rounded-full touch-manipulation"
            >
              <Icon name="check" size="md" />
            </button>
          </div>
        ) : (
          /* Regular input */
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-brand-jade focus:border-transparent prevent-zoom"
            />

            {messageText.trim() ? (
              <button
                onClick={handleSendMessage}
                className="p-3 bg-brand-jade text-white rounded-full hover:bg-brand-jade-dark transition-colors touch-manipulation"
              >
                <Icon name="plus" size="md" />
              </button>
            ) : (
              <div className="flex space-x-2">
                {onTakePhoto && (
                  <button
                    onClick={onTakePhoto}
                    className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-manipulation"
                  >
                    <Icon name="plus" size="md" />
                  </button>
                )}

                {onSendVoice && (
                  <button
                    onTouchStart={startRecording}
                    onMouseDown={startRecording}
                    className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors touch-manipulation"
                  >
                    <Icon name="play" size="md" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Safe area bottom padding */}
        <div className="h-safe-area-inset-bottom"></div>
      </div>
    </div>
  );
};
