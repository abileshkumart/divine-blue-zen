import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, RefreshCw, Heart, Share2, Wind, Sunrise } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import mandalaPattern from "@/assets/mandala-pattern.jpg";
import { BreathingExercise } from '@/components/breathing-exercise';

const affirmations = [
	"I am at peace with myself and the universe flows through me",
	"My breath connects me to the infinite energy of life",
	"I release all tension and embrace divine tranquility",
	"Every cell in my body vibrates with positive energy",
	"I am aligned with my highest purpose and inner wisdom",
	"Peace and clarity guide my thoughts and actions",
	"I trust the journey of my spiritual growth",
	"Divine light surrounds and protects me always",
];

const Affirmation = () => {
	const navigate = useNavigate();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isLiked, setIsLiked] = useState(false);
	const [showBreathing, setShowBreathing] = useState(false);

	const nextAffirmation = () => {
		setCurrentIndex((prev) => (prev + 1) % affirmations.length);
		setIsLiked(false);
	};

	const handleBreathingComplete = () => {
		setShowBreathing(false);
	};

	return (
		<div
			className="min-h-screen bg-background relative overflow-hidden"
			style={{
				backgroundImage: `url(${mandalaPattern})`,
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			{/* Overlay */}
			<div className="absolute inset-0 bg-background/90 backdrop-blur-md" />

			{/* Floating particles */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				{[...Array(15)].map((_, i) => (
					<div
						key={i}
						className="absolute w-1 h-1 bg-accent rounded-full animate-glow-pulse"
						style={{
							left: `${Math.random() * 100}%`,
							top: `${Math.random() * 100}%`,
							animationDelay: `${Math.random() * 3}s`,
							animationDuration: `${3 + Math.random() * 2}s`,
						}}
					/>
				))}
			</div>

			{/* Content */}
			<div className="relative z-10 min-h-screen flex flex-col">
				{/* Header */}
				<header className="p-6 flex items-center justify-between">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate("/home")}
						className="rounded-full hover:bg-accent/20"
					>
						<ChevronLeft className="w-6 h-6" />
					</Button>
					<h1 className="text-xl font-semibold">Daily Affirmations</h1>
					<Button
						variant="ghost"
						size="icon"
						className="rounded-full hover:bg-accent/20"
					>
						<Share2 className="w-5 h-5" />
					</Button>
				</header>

				{/* Main Content */}
				<main className="flex-1 flex items-center justify-center p-6 pb-24">
					<div className="max-w-2xl w-full space-y-8 animate-fade-in-up">
						{/* Affirmation Card */}
						<Card className="p-8 bg-gradient-to-br from-card/80 to-secondary/60 backdrop-blur-xl border-accent/40 shadow-float">
							<div className="text-center space-y-6">
								<div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center animate-float">
									<div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center">
										<div className="w-8 h-8 rounded-full bg-accent animate-glow-pulse" />
									</div>
								</div>

								<p className="text-2xl md:text-3xl font-medium leading-relaxed text-foreground">
									"{affirmations[currentIndex]}"
								</p>

								<div className="flex items-center justify-center gap-4 pt-4">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setIsLiked(!isLiked)}
										className={`rounded-full hover:bg-accent/20 transition-colors ${
											isLiked ? "text-accent" : ""
										}`}
									>
										<Heart
											className={`w-6 h-6 ${
												isLiked ? "fill-current" : ""
											}`}
										/>
									</Button>
									<Button
										onClick={() => setShowBreathing(true)}
										className="rounded-full px-6 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30"
									>
										<Wind className="w-4 h-4 mr-2" />
										Practice Breathing
									</Button>
								</div>
							</div>
						</Card>

						{/* Action Button */}
						<div className="text-center">
							<Button
								size="lg"
								onClick={nextAffirmation}
								className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full shadow-glow hover:shadow-float transition-all duration-300 hover:scale-105 px-8"
							>
								<RefreshCw className="w-5 h-5 mr-2" />
								Next Affirmation
							</Button>
							<p className="text-sm text-muted-foreground mt-4">
								{currentIndex + 1} of {affirmations.length}
							</p>
						</div>

						{/* Breathing Guide */}
						<Card className="p-6 bg-card/60 backdrop-blur-sm border-indigo/30 text-center">
							<h3 className="text-sm font-semibold text-indigo mb-2 uppercase tracking-wider">
								Breathe & Reflect
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Take three deep breaths. Inhale positivity, exhale tension.
								Let this affirmation resonate within you.
							</p>
						</Card>
					</div>
				</main>

			</div>

			{/* Breathing Exercise */}
			<BreathingExercise
				isOpen={showBreathing}
				onComplete={handleBreathingComplete}
			/>

			{/* Bottom Navigation */}
			<nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 p-4 z-50">
				<div className="flex items-center justify-around max-w-md mx-auto">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate('/home')}
						className="flex flex-col gap-1 h-auto py-2"
					>
						<Wind className="w-6 h-6" />
						<span className="text-xs">Home</span>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate('/calendar')}
						className="flex flex-col gap-1 h-auto py-2"
					>
						<div className="w-6 h-6 flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
								<line x1="16" y1="2" x2="16" y2="6"></line>
								<line x1="8" y1="2" x2="8" y2="6"></line>
								<line x1="3" y1="10" x2="21" y2="10"></line>
							</svg>
						</div>
						<span className="text-xs">Calendar</span>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="flex flex-col gap-1 h-auto py-2 text-accent"
					>
						<Heart className="w-6 h-6" />
						<span className="text-xs">Affirmations</span>
					</Button>
					<Button
						variant="ghost"
						size="icon"
						onClick={() => navigate('/profile')}
						className="flex flex-col gap-1 h-auto py-2"
					>
						<div className="w-6 h-6 flex items-center justify-center">
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
								<circle cx="12" cy="7" r="4"></circle>
							</svg>
						</div>
						<span className="text-xs">Profile</span>
					</Button>
				</div>
			</nav>
		</div>
	);
};

export default Affirmation;
