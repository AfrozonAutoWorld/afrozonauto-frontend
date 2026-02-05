import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "Is this car good for African roads?",
  "Explain the import fees",
  "How long does delivery take?",
  "What's the refund policy?",
  "Compare RoRo vs Container shipping",
];

const AI_RESPONSES: Record<string, string> = {
  "african roads": `Great question! For African roads, I recommend:

**Best choices:**
- **SUVs** (Toyota RAV4, Honda CR-V, Lexus RX) - Higher ground clearance handles unpaved roads well
- **Trucks** (Toyota Hilux, Ford F-150) - Excellent for rough terrain
- **Sedans with high clearance** (Toyota Camry) - Reliable and practical

**Key features to look for:**
- Ground clearance of 170mm+
- Robust suspension
- All-wheel drive (preferred)
- Smaller wheels (17-18") for better tire availability

**Brands known for Africa reliability:**
Toyota, Honda, Lexus, Nissan - parts are readily available across Nigeria.`,

  "import fees": `Here's a breakdown of Nigerian import fees:

**Customs Duties & Taxes:**
- **Import Duty:** 35% of CIF value
- **VAT:** 7.5% of (CIF + Duty)
- **CISS Levy:** 15% of CIF value

**CIF Value** = Vehicle Price + Shipping Cost

**Other Costs:**
- Clearing & Documentation: ~$800
- Port Charges: ~$400
- Local Delivery: $200-600 (varies by state)

**Example:** For a $20,000 vehicle:
- Duties/Taxes: ~$11,500
- Fees: ~$1,400
- Shipping: ~$1,800-2,500
- **Total Landed:** ~$34,700-35,400

Use our calculator for exact estimates!`,

  "delivery": `**Typical Delivery Timeline:**

**RoRo Shipping (45 days):**
- US Processing: 5-7 days
- Ocean Transit: 28-35 days
- Port Clearance: 5-7 days
- Local Delivery: 1-3 days

**Container Shipping (60 days):**
- US Processing: 7-10 days
- Ocean Transit: 35-42 days
- Port Clearance: 7-10 days
- Local Delivery: 1-3 days

**Factors that may affect timing:**
- Port congestion
- Customs inspections
- Weather conditions
- Documentation issues

We provide real-time tracking updates throughout the process!`,

  "refund": `**Afrozon Refund Policy:**

**Before Vehicle Purchase:**
- Full deposit refund if inspection fails
- Full refund if vehicle unavailable
- Processing fee may apply (usually $100)

**After Vehicle Purchase:**
- No refunds once Afrozon purchases the vehicle
- This is clearly stated before deposit

**Inspection Stage:**
- You receive detailed inspection report
- You can reject vehicle if issues found
- Full deposit returned if you decline

**Important Notes:**
- All deposits held in escrow until approval
- Clear approval checkpoint before we buy
- Communication required within 48hrs of inspection

Questions? Our team is here to help!`,

  "roro container": `**RoRo vs Container Shipping:**

**RoRo (Roll-on/Roll-off):**
- Cost: ~$1,800-2,000
- Time: ~45 days
- Best for: Single vehicles
- Pros: More affordable, faster
- Cons: Vehicle exposed to elements

**Container Shipping:**
- Cost: ~$2,500-3,000
- Time: ~60 days
- Best for: Multiple vehicles, luxury cars
- Pros: Protected from weather/damage
- Cons: Higher cost, longer time

**Recommendation:**
- Standard vehicles: RoRo
- Luxury/classic cars: Container
- Multiple vehicles: Container (share costs)

Both are insured and tracked throughout transit.`,

  "default": `I'm your Afrozon Auto Concierge! I can help you with:

- **Vehicle Selection** - Finding the right car for African roads
- **Cost Breakdown** - Understanding all fees and taxes
- **Import Process** - Step-by-step guidance
- **Delivery Timeline** - Estimated shipping times
- **Policies** - Refunds, payments, and more

What would you like to know? Feel free to ask anything about importing your vehicle to Nigeria!`
};

function getAIResponse(question: string): string {
  const lowerQuestion = question.toLowerCase();

  if (lowerQuestion.includes('african') || lowerQuestion.includes('africa') || lowerQuestion.includes('road') || lowerQuestion.includes('suitable') || lowerQuestion.includes('good for')) {
    return AI_RESPONSES['african roads'];
  }
  if (lowerQuestion.includes('fee') || lowerQuestion.includes('duty') || lowerQuestion.includes('tax') || lowerQuestion.includes('cost') || lowerQuestion.includes('price')) {
    return AI_RESPONSES['import fees'];
  }
  if (lowerQuestion.includes('delivery') || lowerQuestion.includes('long') || lowerQuestion.includes('time') || lowerQuestion.includes('timeline') || lowerQuestion.includes('days')) {
    return AI_RESPONSES['delivery'];
  }
  if (lowerQuestion.includes('refund') || lowerQuestion.includes('policy') || lowerQuestion.includes('cancel') || lowerQuestion.includes('return')) {
    return AI_RESPONSES['refund'];
  }
  if (lowerQuestion.includes('roro') || lowerQuestion.includes('container') || lowerQuestion.includes('shipping method') || lowerQuestion.includes('ship')) {
    return AI_RESPONSES['roro container'];
  }

  return AI_RESPONSES['default'];
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your Afrozon Auto Concierge. I can help you choose the right vehicle for Africa, understand import costs, and answer any questions about our process. How can I assist you today?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = getAIResponse(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        </div>
      </button>

      <div
        className={`fixed bottom-6 right-6 z-50 w-full max-w-md transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[600px]">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Auto Concierge</h3>
                <p className="text-emerald-100 text-xs">Powered by AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-gray-200'
                      : 'bg-emerald-100'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content.split('\n').map((line, i) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={i} className="font-semibold mt-2 first:mt-0">{line.replace(/\*\*/g, '')}</p>;
                      }
                      if (line.startsWith('- **')) {
                        const parts = line.replace('- **', '').split('**');
                        return (
                          <p key={i} className="ml-2">
                            <span className="font-medium">{parts[0]}</span>
                            {parts[1]}
                          </p>
                        );
                      }
                      if (line.startsWith('- ')) {
                        return <p key={i} className="ml-2">{line}</p>;
                      }
                      return <p key={i}>{line}</p>;
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.slice(0, 3).map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-xs bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about vehicles, prices, shipping..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
