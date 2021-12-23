require('dotenv').config();
const nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  }
});
// MAIL kích hoạt tài khoản
export const mail_registry_citizen = async(dataSend:any) => {
 
  const info = await transporter.sendMail({
    from: '" Cục Cảnh Sát Giao Thông" <cuccsgtvn@gmail.com>',
    to: dataSend.email,
    subject: 'Kích hoạt tài khoản',
    html: `
    <p>Xin chào <b>${dataSend.fullname}</b></p> 
    <p>Cảm ơn bạn đã đăng ký tài khoản trên hệ thống đăng ký xe trực tuyến. Để có được trải nghiệm dịch vụ và được hỗ trợ tốt nhất, bạn cần kích hoạt tài khoản.</p>
    <p>Vui lòng bấm nút Kích hoạt để hoàn tất quá trình này.</p>
    <a href=${dataSend.url} style="color:#fff;text-decoration:none;display:inline-block;background-color:#00b14f;padding:12px 20px;font-weight:bold;border-radius:4px"><strong>Kích hoạt</strong></a>
    `,

  });
}
// mail khai bao ho sơ
export const  mail_registry_car= async(dataSend:any) => {
  const  info = await transporter.sendMail({
    from: '" Cục Cảnh Sát Giao Thông" <cuccsgtvn@gmail.com>',
    cc: [dataSend.email,dataSend.departmentEmail],
    subject: 'Thông báo khai báo hồ sơ',
    html: `
    <div style="width:935px;height:103px;margin:auto;text-align:center;color:#000">
      <div style="width:430px;float:left;font-size:11.5pt">
        <div style="text-transform:uppercase">BỘ CÔNG AN<br><b>CỤC CẢNH SÁT GIAO THÔNG</b><br>
          <div style="border-bottom:1px solid #333;width:100px;height:1px;margin:0 auto 5px"></div>
        </div>
      </div>
      <div style="width:430px;float:right;font-size:11.5pt">
        <div style="font-weight:700;text-transform:uppercase">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</div>
        <div>Độc lập - Tự do - Hạnh phúc</div>
        <div style="border-bottom:1px solid #333;width:240px;height:1px;margin:0 auto 5px"></div>
        <div style="font-style:italic">Hà Nội, Ngày ${dataSend.day} tháng ${dataSend.month} năm ${dataSend.year}</div>
      </div> 
    </div>
    <div style="text-align:center;color:#000;font-size:14px">
      <h4>KHAI BÁO HỒ SƠ</h4>
      Mã hồ sơ: ${dataSend.id}
    </div>

    
    <p>Kính gửi !</p>
    <p>Hồ sơ đã khai báo thành công và đang trong quá trình tiếp nhận và xử lý</p>
    <p>Họ và tên người nộp: <b> ${dataSend.fullName}</b></p>
    <p>Tên thủ tục: ${dataSend.profile_name}</p>
    <p>Thời gian: ${dataSend.date}</p>
    <p>Cơ quan thực hiện : <b>${dataSend.departmentName}</b></p>
    <p>Địa chỉ: ${dataSend.departmentAddress}</p>
    <p>Số điện thoại: ${dataSend.departmentPhone}</p>
    <p>Vui lòng liên hệ trực tiếp cơ quan thực hiện để  được hướng dẫn cụ thể và dặt lịch hoàn thành thủ tục đăng ký xe</p>

    `,

  });
}
// ok 



// mail hoa thanh ho so - hẹn lay giay chung nhan
  export const  mail_registered_car= async(dataSend:any) => {

    const info = await transporter.sendMail({
      from: dataSend.send,
      to: dataSend.email,
      envelope: {
        from: dataSend.send ,
        to: dataSend.email,
      },
      subject: 'Thông báo hoàn thành hồ sơ',
      html: `
      <div style="width:935px;height:103px;margin:auto;text-align:center;color:#000">
        <div style="width:430px;float:left;font-size:11.5pt">
          <div style="text-transform:uppercase">CÔNG AN TỈNH ${dataSend.city_name}<br><b>PHÒNG CẢNH SÁT GIAO THÔNG</b><br>
            <div style="border-bottom:1px solid #333;width:100px;height:1px;margin:0 auto 5px"></div>
          </div>
        </div>
        <div style="width:430px;float:right;font-size:11.5pt">
          <div style="font-weight:700;text-transform:uppercase">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</div>
          <div>Độc lập - Tự do - Hạnh phúc</div>
          <div style="border-bottom:1px solid #333;width:240px;height:1px;margin:0 auto 5px"></div>
        </div> 
      </div>
      <div style="text-align:center;color:#000;font-size:14px">
        <h4>GIẤY HẸN TRẢ KẾT QUẢ</h4>
      </div>
      
      <p>${dataSend.departmentName}</p>
      <p>Đã tiếp nhận hồ sơ về việc :${dataSend.registionName}</p>
      <p>Biến số kiểm soát: ${dataSend.registration_number}</p> 
      <p>Nhãn hiệu: ${dataSend.brand} &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; Số loại: ${dataSend.model} </p> 
      <p>Số máy: ${dataSend.engineNumber} &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; Số khung:${dataSend.chassisNumber} </p> 
      <p>Địa chỉ: ${dataSend.district_name},${dataSend.city_name}</p>
      <p>Hẹn ông (bà) sau 2 ngày (trừ ngày lễ, chủ nhật)</p>
      <p>Đến nhận kết quả tại: ${dataSend.departmentAddress}</p>
      <br/>
      <div style="width:430px;float:right">
        <div style="font-style:italic">${dataSend.city_name}, Ngày ${dataSend.date} tháng ${dataSend.month} năm ${dataSend.year}</div>
      </div>
  
      `,
  
    });
}


//mail duyet ho so - ho co co loi
export const mail_edit_confirmRegistration= async(dataSend:any) => {
  const info = await transporter.sendMail({
    from: dataSend.send,
      to: dataSend.email,
      envelope: {
        from: dataSend.send ,
        to: dataSend.email,
      },
    subject: 'Thông báo chỉnh sửa hồ sơ',
    html: `
    <div style="width:935px;height:103px;margin:auto;text-align:center;color:#000">
      <div style="width:430px;float:left;font-size:11.5pt">
        <div style="text-transform:uppercase">CÔNG AN TỈNH ${dataSend.city_name}<br><b>PHÒNG CẢNH SÁT GIAO THÔNG</b><br>
          <div style="border-bottom:1px solid #333;width:100px;height:1px;margin:0 auto 5px"></div>
        </div>
      </div>
      <div style="width:430px;float:right;font-size:11.5pt">
        <div style="font-weight:700;text-transform:uppercase">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</div>
        <div>Độc lập - Tự do - Hạnh phúc</div>
        <div style="border-bottom:1px solid #333;width:240px;height:1px;margin:0 auto 5px"></div>
      </div> 
    </div>
    <div style="text-align:center;color:#000;font-size:14px">
      <h4>CHỈNH SỬA HỒ SƠ</h4>
    </div>
    <p>Kính gửi <b>${dataSend.user}</b></p>
    <p>${dataSend.departmentName} đã tiếp nhận hồ sơ về việc: ${dataSend.registionName}</p>
    <p>Chúng tôi nhận thấy hồ  sơ: ${dataSend.content}</p>
    <p>Mong bạn điều chỉnh  thông tin hồ sơ sớm nhất có thể</p>
    <br/>
    <div style="width:430px;float:right">
      <div style="font-style:italic">${dataSend.city_name}, Ngày ${dataSend.date} tháng ${dataSend.month} năm ${dataSend.year}</div>
    </div>

    `,

  });
}

// mail duyet ho so -gui lich hen
export const mail_confirmRegistration= async(dataSend:any) => {
  
  const info = await transporter.sendMail({
    from: dataSend.send,
    to: dataSend.email,
    envelope: {
      from: dataSend.send ,
      to: dataSend.email,
    },
    subject: 'Thông báo lịch hẹn xử lý hồ sơ',
    html: `
    <div style="width:935px;height:103px;margin:auto;text-align:center;color:#000">
      <div style="width:430px;float:left;font-size:11.5pt">
        <div style="text-transform:uppercase">CÔNG AN TỈNH ${dataSend.city_name}<br><b>PHÒNG CẢNH SÁT GIAO THÔNG</b><br>
          <div style="border-bottom:1px solid #333;width:100px;height:1px;margin:0 auto 5px"></div>
        </div>
      </div>
      <div style="width:430px;float:right;font-size:11.5pt">
        <div style="font-weight:700;text-transform:uppercase">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</div>
        <div>Độc lập - Tự do - Hạnh phúc</div>
        <div style="border-bottom:1px solid #333;width:240px;height:1px;margin:0 auto 5px"></div>
      </div> 
    </div>
    <div style="text-align:center;color:#000;font-size:14px">
      <h4>GIẤY HẸN XỬ LÝ HỒ SƠ</h4>
    </div>
    
    <p>${dataSend.departmentName}</p>
    <p>Hẹn ông (bà),cơ quan, tổ chức: ${dataSend.user}</p>
    <p>Địa chỉ: ${dataSend.district_name},${dataSend.city_name}</p>
    <p>Vào ${dataSend.time}, ngày ${dataSend.booking_date}</p>
    <p>Số thứ tự: ${dataSend.number}   &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;  Mã hồ sơ : ${dataSend.id}</p>
    <p>Đến ${dataSend.departmentName} tại ${dataSend.departmentAddress} để thực hiện xử lý, hoàn thành thủ tục </p>
    <br/>
    <div style="width:430px;float:right">
      <div style="font-style:italic">${dataSend.city_name}, Ngày ${dataSend.date} tháng ${dataSend.month} năm ${dataSend.year}</div>
    </div>

    `,

  });
}

// mail xac nhan chuyen dang ky
export const  mail_tranfer_car= async(dataSend:any) => {
  const info = await transporter.sendMail({
    from: '" Cục Cảnh Sát Giao Thông" <cuccsgtvn@gmail.com>',
    cc: [dataSend.currentOwner_email,dataSend.newOwner_email, dataSend.departmentMail],
    subject: 'Thông báo khai báo hồ sơ',
    html: `
    <div style="width:935px;height:103px;margin:auto;text-align:center;color:#000">
      <div style="width:430px;float:left;font-size:11.5pt">
        <div style="text-transform:uppercase">BỘ CÔNG AN<br><b>CỤC CẢNH SÁT GIAO THÔNG</b><br>
          <div style="border-bottom:1px solid #333;width:100px;height:1px;margin:0 auto 5px"></div>
        </div>
      </div>
      <div style="width:430px;float:right;font-size:11.5pt">
        <div style="font-weight:700;text-transform:uppercase">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</div>
        <div>Độc lập - Tự do - Hạnh phúc</div>
        <div style="border-bottom:1px solid #333;width:240px;height:1px;margin:0 auto 5px"></div>
        <div style="font-style:italic">Hà Nội, Ngày ${dataSend.date} tháng ${dataSend.month} năm ${dataSend.year}</div>
      </div> 
    </div>
    <div style="text-align:center;color:#000;font-size:14px">
      <h4>KHAI BÁO HỒ SƠ</h4>
    </div>
  
    <p>Kính gửi !</p>
    <p>Tên thủ tục: <b>${dataSend.profile_name}</b></p>
    <p>Chủ xe hiện tại:  ${dataSend.currentOwner_name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Địa chỉ: ${dataSend.current_district}, ${dataSend.current_city}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Số điện thoại: ${dataSend.current_phonenumber}</p>
    <p>Có chiếc xe với các đặc điểm sau:</p>
    <p>Biển số : ${dataSend.regNumber} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Nhãn hiệu : ${dataSend.brand}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Loại xe: ${dataSend.model} </p>
    <p>Màu: ${dataSend.color}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Số khung: ${dataSend.chassisNumber} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Số máy: ${dataSend.engineNumber} </p>
    <Địa>Chiếc xe trên được đăng ký sang tên, di chuyển xe cho ông(bà): <b>${dataSend.newOwner_name}</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Địa chỉ: ${dataSend.new_district}, ${dataSend.new_city}</p>
    <p>Vui lòng chấp nhận yêu cầu và đến trụ sở CSGT tại nơi đăng ký để hoàn tất thủ tục </p>

    `,

  });
}
// mail khai bao ho sơ
export const  mail_rejectRegistration= async(dataSend:any) => {
  const  info = await transporter.sendMail({
    from: '" Cục Cảnh Sát Giao Thông" <cuccsgtvn@gmail.com>',
    cc: [dataSend.email,dataSend.departmentEmail],
    subject: 'Thông báo hủy đăng ký',
    html: `
    <div style="width:935px;height:103px;margin:auto;text-align:center;color:#000">
      <div style="width:430px;float:left;font-size:11.5pt">
        <div style="text-transform:uppercase">BỘ CÔNG AN<br><b>CỤC CẢNH SÁT GIAO THÔNG</b><br>
          <div style="border-bottom:1px solid #333;width:100px;height:1px;margin:0 auto 5px"></div>
        </div>
      </div>
      <div style="width:430px;float:right;font-size:11.5pt">
        <div style="font-weight:700;text-transform:uppercase">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</div>
        <div>Độc lập - Tự do - Hạnh phúc</div>
        <div style="border-bottom:1px solid #333;width:240px;height:1px;margin:0 auto 5px"></div>
        <div style="font-style:italic">Hà Nội, Ngày ${dataSend.date} tháng ${dataSend.month} năm ${dataSend.year}</div>
      </div> 
    </div>
    <div style="text-align:center;color:#000;font-size:14px">
      <h4>HỦY ĐĂNG KÝ</h4>
      Mã hồ sơ: ${dataSend.id}
    </div>
    <p>Kính gửi <b> ${dataSend.fullName}</b></p>
    <p>Hồ sơ đăng ký của bạn đã bị hủy</p>
    `,

  });
}
// mail khai bao ho sơ
export const  mail_rejectTransfer= async(dataSend:any) => {
  const  info = await transporter.sendMail({
    from: '" Cục Cảnh Sát Giao Thông" <cuccsgtvn@gmail.com>',
    cc: [dataSend.currentOwner,dataSend.departmentEmail,dataSend.newOwner],
    subject: 'Thông báo hủy chuyển sở hữu',
    html: `
    <div style="width:935px;height:103px;margin:auto;text-align:center;color:#000">
      <div style="width:430px;float:left;font-size:11.5pt">
        <div style="text-transform:uppercase">BỘ CÔNG AN<br><b>CỤC CẢNH SÁT GIAO THÔNG</b><br>
          <div style="border-bottom:1px solid #333;width:100px;height:1px;margin:0 auto 5px"></div>
        </div>
      </div>
      <div style="width:430px;float:right;font-size:11.5pt">
        <div style="font-weight:700;text-transform:uppercase">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</div>
        <div>Độc lập - Tự do - Hạnh phúc</div>
        <div style="border-bottom:1px solid #333;width:240px;height:1px;margin:0 auto 5px"></div>
        <div style="font-style:italic">Hà Nội, Ngày ${dataSend.date} tháng ${dataSend.month} năm ${dataSend.year}</div>
      </div> 
    </div>
    <div style="text-align:center;color:#000;font-size:14px">
      <h4>HỦY YÊU CẦU SANG TÊN XE</h4>
      Mã hồ sơ: ${dataSend.id}
    </div>
    <p>Kính gửi !</p>
    <p>Ông (bà): <b> ${dataSend.currentOwnerName} , ${dataSend.newOwnerName}</b></p>
    <p>Yêu cầu chuyển sở hữu xe của bạn đã bị hủy</p>
    `,

  });
}
// mail chấp nhận yêu cầu chuyển sơ huu
export const  mail_approveTransfer= async(dataSend:any) => {
  const  info = await transporter.sendMail({
    from: '" Cục Cảnh Sát Giao Thông" <cuccsgtvn@gmail.com>',
    cc: [dataSend.currentOwner],
    subject: 'Thông báo trạng thái yêu cầu chuyển sở hữu',
    html: `
    <div style="width:935px;height:103px;margin:auto;text-align:center;color:#000">
      <div style="width:430px;float:left;font-size:11.5pt">
        <div style="text-transform:uppercase">BỘ CÔNG AN<br><b>CỤC CẢNH SÁT GIAO THÔNG</b><br>
          <div style="border-bottom:1px solid #333;width:100px;height:1px;margin:0 auto 5px"></div>
        </div>
      </div>
      <div style="width:430px;float:right;font-size:11.5pt">
        <div style="font-weight:700;text-transform:uppercase">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</div>
        <div>Độc lập - Tự do - Hạnh phúc</div>
        <div style="border-bottom:1px solid #333;width:240px;height:1px;margin:0 auto 5px"></div>
        <div style="font-style:italic">Hà Nội, Ngày ${dataSend.date} tháng ${dataSend.month} năm ${dataSend.year}</div>
      </div> 
    </div>
    <div style="text-align:center;color:#000;font-size:14px">
      <h4>CHẤP NHẬN SANG TÊN XE</h4>
      Mã hồ sơ: ${dataSend.id}
    </div>
    <p>Kính gửi !</p>
    <p>Ông (bà): <b> ${dataSend.currentOwnerName} </b></p>
    <p>Yêu cầu chuyển sở hữu của bạn đã được ông (bà): <b>${dataSend.newOwnerName}</b> chấp nhận </p>
    <p>Đến trụ sở đăng ký để hoàn tất thủ tục</p>
    `,

  });
}
// mail chấp nhận yêu cầu chuyển sơ huu
export const  mail_comfirmTransfer= async(dataSend:any) => {
  const  info = await transporter.sendMail({
    from: '" Cục Cảnh Sát Giao Thông" <cuccsgtvn@gmail.com>',
    cc: [dataSend.currentOwner_email,dataSend.newOwner_email],
    subject: 'Thông báo hoàn thành sang tên xe',
    html: `
    <div style="width:935px;height:103px;margin:auto;text-align:center;color:#000">
      <div style="width:430px;float:left;font-size:11.5pt">
        <div style="text-transform:uppercase">BỘ CÔNG AN<br><b>CỤC CẢNH SÁT GIAO THÔNG</b><br>
          <div style="border-bottom:1px solid #333;width:100px;height:1px;margin:0 auto 5px"></div>
        </div>
      </div>
      <div style="width:430px;float:right;font-size:11.5pt">
        <div style="font-weight:700;text-transform:uppercase">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</div>
        <div>Độc lập - Tự do - Hạnh phúc</div>
        <div style="border-bottom:1px solid #333;width:240px;height:1px;margin:0 auto 5px"></div>
        <div style="font-style:italic">Hà Nội, Ngày ${dataSend.date} tháng ${dataSend.month} năm ${dataSend.year}</div>
      </div> 
    </div>
    <div style="text-align:center;color:#000;font-size:14px">
      <h4>HOÀN THÀNH HỒ SƠ</h4>
      Mã hồ sơ: ${dataSend.id}
    </div>
    <p>Kính gửi !</p>
    <p>Ông (bà): <b> ${dataSend.currentOwnerName}, ${dataSend.newOwnerName} </b></p>
    <p>Yêu cầu chuyển sở hữu xe đã hoàn tất.</p>
    <p>Thông tin cơ bản của xe:</p>
    <p>Loại xe: ${dataSend.model} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Nhãn hiệu : ${dataSend.brand}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Biển số : ${dataSend.regNumber}</p>
    <p>Màu: ${dataSend.color}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Số khung: ${dataSend.chassisNumber} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Số máy: ${dataSend.engineNumber} </p>
    `,

  });
}