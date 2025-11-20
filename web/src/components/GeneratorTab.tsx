/**
 * Generator Tab - Embeds the Paykey Generator Python app via iframe
 */
export const GeneratorTab: React.FC = () => {
  return (
    <div className="w-full h-full">
      <iframe
        src="http://localhost:8081"
        className="w-full h-full border-0"
        title="Paykey Generator"
      />
    </div>
  );
};
