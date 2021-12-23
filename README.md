# vehicle-management-system-base-on-blockchain
Yêu cầu: Hệ điều hành Ubuntu 18.04 trở lên, đã cài đặt NodeJS, docker, docker
compose
Bước 1. Clone project về máy:
git clone https://github.com/truongngocanh99/vehicle-management-system-base-on-blockchain.git

Bước 2. Cài đặt Hyperledger Fabric và các docker image cần thiết của Fabric:curl -sSL https://bit.ly/2ysbOFE | bash -s

Bước 3. Tại thư mục vehicle-management-system-base-on-blockchain/test-network, thực hiện lệnh ./startCarRegistration.sh để khởi động mạng Fabric và deploy
chaincode.

Bước 4. Tại thư mục vehicle-management-system-base-on-blockchain/server, lần
lượt thực hiện các lệnh npm install (chỉ thực hiện lần đầu), npm start để khởi chạy API
server.

Bước 5. Tại thư mục vehicle-management-system-base-on-blockchain/web, lần
lượt thực hiện các lệnh npm install (chỉ thực hiện lần đầu), npm start để khởi chạy React
App.

Bước 6. Truy cập localhost:8000 để sử dụng ứng dụng.
