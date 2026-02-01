let ioInstance = null;
export const setSocketInstance = (io) => {
  ioInstance = io;
};
export const getSocketInstance = () => {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized!");
  }
  return ioInstance;
};
