export default function JobApplicationButton({ position, onClick }) {
  return (
    <button
      onClick={() => onClick(position)}
      className="btn-hover-effect w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg text-white font-medium shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
    >
      <span>Apply Now</span>
    </button>
  );
} 