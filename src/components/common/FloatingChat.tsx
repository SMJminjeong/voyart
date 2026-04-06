import { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  role: 'ai' | 'user';
  text: string;
}

const DUMMY_RESPONSES = [
  '더 궁금한 여행지가 있으신가요? 감성에 맞는 곳을 찾아드릴게요 ✈️',
  '그 지역의 숨겨진 명소도 알려드릴 수 있어요. 어떤 분위기를 원하시나요?',
  '여행 일정 조율이 필요하시면 말씀해 주세요 🗺️',
  '현지 맛집이나 카페 정보도 추천해 드릴 수 있어요!',
  '여행 준비물이나 날씨 정보도 알려드릴게요 ☀️',
];

const INITIAL_MESSAGE: Message = {
  id: 0,
  role: 'ai',
  text: '안녕하세요! 여행에 대해 궁금한 점이 있으시면 무엇이든 물어보세요 🌍',
};

let nextId = 1;

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    setMessages((prev) => [...prev, { id: nextId++, role: 'user', text }]);
    setInput('');
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 800));

    const response = DUMMY_RESPONSES[Math.floor(Math.random() * DUMMY_RESPONSES.length)];
    setMessages((prev) => [...prev, { id: nextId++, role: 'ai', text: response }]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* 채팅 패널 */}
      <div
        className={`
          w-80 flex flex-col rounded-2xl overflow-hidden shadow-2xl
          bg-white/10 backdrop-blur-xl border border-white/20
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}
        `}
        style={{ height: '420px' }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/90 text-sm font-medium">AI 여행 도우미</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/50 hover:text-white/90 transition-colors text-lg leading-none"
            aria-label="채팅 닫기"
          >
            ×
          </button>
        </div>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-white/25 text-white rounded-br-sm'
                    : 'bg-white/10 text-white/85 rounded-bl-sm border border-white/10'
                  }
                `}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* 타이핑 인디케이터 */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white/10 border border-white/10 px-4 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-white/60 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* 입력창 */}
        <div className="px-3 py-3 border-t border-white/15 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            disabled={isTyping}
            className="
              flex-1 bg-white/10 border border-white/15 rounded-xl
              px-3 py-2 text-sm text-white placeholder-white/40
              focus:outline-none focus:border-white/35 focus:bg-white/15
              disabled:opacity-50 transition-colors
            "
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="
              w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30
              flex items-center justify-center
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-colors flex-shrink-0
            "
            aria-label="전송"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="
          w-14 h-14 rounded-full shadow-xl
          bg-white/20 hover:bg-white/30 backdrop-blur-xl
          border border-white/25 hover:border-white/40
          flex items-center justify-center
          transition-all duration-200 hover:scale-105 active:scale-95
        "
        aria-label={isOpen ? '채팅 닫기' : '채팅 열기'}
      >
        <span className="text-2xl">{isOpen ? '💬' : '✨'}</span>
      </button>
    </div>
  );
}
