import { useEffect, useState } from 'react'
import { Sparkles, Zap } from 'lucide-react'

const AntigravityEffect = ({ isActive, onToggle }) => {
  const [particles, setParticles] = useState([])
  const [isFloating, setIsFloating] = useState(false)

  useEffect(() => {
    if (isActive) {
      // 중력 효과 시작
      enableAntigravity()
      createParticles()
    } else {
      // 중력 효과 종료
      disableAntigravity()
      setParticles([])
    }
  }, [isActive])

  const createParticles = () => {
    const newParticles = []
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 6 + 2,
        color: `hsl(${Math.random() * 60 + 300}, 70%, 60%)`, // 핑크-퍼플 색상
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      })
    }
    setParticles(newParticles)
    animateParticles(newParticles)
  }

  const animateParticles = (currentParticles) => {
    if (!isActive) return

    const updatedParticles = currentParticles.map(particle => ({
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      rotation: particle.rotation + particle.rotationSpeed,
      // 화면 경계 처리
      ...(particle.x > window.innerWidth && { x: 0 }),
      ...(particle.x < 0 && { x: window.innerWidth }),
      ...(particle.y > window.innerHeight && { y: 0 }),
      ...(particle.y < 0 && { y: window.innerHeight })
    }))

    setParticles(updatedParticles)
    
    setTimeout(() => animateParticles(updatedParticles), 50)
  }

  const enableAntigravity = () => {
    setIsFloating(true)
    
    // 모든 카드와 요소들에 floating 애니메이션 적용
    const elements = document.querySelectorAll('article, .stat-card, .filter-card, button')
    elements.forEach((element, index) => {
      element.style.transition = 'transform 0.5s ease-out'
      element.style.transform = `translateY(${-10 - Math.random() * 20}px) rotate(${(Math.random() - 0.5) * 5}deg)`
      element.style.animationDelay = `${index * 0.1}s`
    })

    // 배경에 floating 애니메이션 적용
    document.body.style.animation = 'antigravity-float 3s ease-in-out infinite alternate'
    
    // CSS 키프레임 추가
    if (!document.querySelector('#antigravity-styles')) {
      const style = document.createElement('style')
      style.id = 'antigravity-styles'
      style.textContent = `
        @keyframes antigravity-float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-5px); }
        }
        
        @keyframes particle-float {
          0% { transform: translateY(0px) scale(1); opacity: 0.7; }
          50% { transform: translateY(-10px) scale(1.1); opacity: 1; }
          100% { transform: translateY(0px) scale(1); opacity: 0.7; }
        }
        
        .floating-element {
          animation: particle-float 2s ease-in-out infinite;
        }
        
        .antigravity-text {
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient-shift 3s ease infinite;
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `
      document.head.appendChild(style)
    }
  }

  const disableAntigravity = () => {
    setIsFloating(false)
    
    // 모든 요소의 변형 제거
    const elements = document.querySelectorAll('article, .stat-card, .filter-card, button')
    elements.forEach(element => {
      element.style.transform = ''
      element.style.transition = ''
      element.style.animationDelay = ''
    })

    document.body.style.animation = ''
    
    // 스타일 제거
    const styleElement = document.querySelector('#antigravity-styles')
    if (styleElement) {
      styleElement.remove()
    }
  }

  return (
    <>
      {/* 토글 버튼 */}
      <div className="fixed top-20 right-6 z-50">
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-4 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg ${
            isActive 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/30 scale-110' 
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:shadow-xl'
          }`}
        >
          {isActive ? (
            <>
              <Zap className="w-5 h-5" />
              <span className="antigravity-text">Antigravity ON</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Antigravity</span>
            </>
          )}
        </button>
      </div>

      {/* 파티클 효과 */}
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {particles.map(particle => (
            <div
              key={particle.id}
              className="absolute floating-element"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                backgroundColor: particle.color,
                borderRadius: '50%',
                transform: `rotate(${particle.rotation}deg)`,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                animationDelay: `${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* 배경 오버레이 */}
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 animate-pulse"></div>
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30 floating-element"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* 알림 메시지 */}
      {isActive && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg backdrop-blur-sm border border-white/20 animate-bounce">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">중력이 해제되었습니다! 🚀</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AntigravityEffect