
import SpinFC from 'antd/es/spin';


const LoadingScreen = ({ spinning }: { spinning: boolean }) => {
 if(!spinning) return
  return (
    <div className="fixed w-full h-full flex justify-center items-center z-[99999] top-0 left-0 bg-[rgba(0,0,0,0.1)]">
      <SpinFC spinning={true} />
    </div>
  );
};

export default LoadingScreen;
