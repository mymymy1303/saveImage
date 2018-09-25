$scope.saveImage = function () {
	/**
	 * Tạo một canvas và append vào cây DOM, node cha của nó là thẻ body.
	 * Chỉ dùng để hỗ trợ cho hàm saveImage nên để display: none
	 * Kích thước mặc định là 1500px x 1125px để bảo đảm chất lượng hình ảnh khi xuất ra
	 * Không có giá trị trả về
	 * @param {Id đặt cho thẻ canvas} canvasId
	 */
	const createCanvas = (canvasId) => {
		let canvas = document.createElement('canvas')
		canvas.id = canvasId
		canvas.width = 1500
		canvas.height = 1125
		canvas.style.display = 'none'
		document.body.appendChild(canvas);
	}

	/**
	 * Tạo một Image object, có attribute src là đường dẫn imgUrl truyền vào
	 * @return 1 promise, resolve khi image được load thành công, reject khi có lỗi xảy ra.
	 * @param {Đường dẫn của ảnh cần tạo} imgUrl 
	 */
	const createImage = imgUrl => {
		return new Promise((resolve, reject) => {
			try {
				const img = new Image();
				img.onload = () => resolve(img);
				img.src = imgUrl;
			} catch (error) {
				reject(error);
			}
		});
	};


	/**
	 * Vẽ image với colorCode tương ứng lên canvas, 1 image 1 lần gọi hàm.
	 * @return 1 promise, resolve khi image được draw thành công, reject khi có lỗi xảy ra.
	 * @param {Image object} image 
	 * @param {Mã màu cần phủ lên image, có dạng mã Hex} colorCode 
	 */
	const drawImage = (image, colorCode) => {
		return new Promise((resolve, reject) => {
			try {
				//Tạo 2 biến chứa object CanvasRenderingContext2D để render hình ảnh
				//2 canvas được tạo ẩn, và sẽ bị remove khỏi DOM ngay khi download hình ảnh
				let canvas = document.getElementById("myCanvas");
				let tempCanvas = document.getElementById("tempCanvas");

				let context = canvas.getContext("2d");
				let tempContext = tempCanvas.getContext("2d");

				//Vẽ image lên tempCanvas - canvas phụ
				tempContext.drawImage(image, 0, 0);
				if (colorCode !== "") {
					//Nếu colorCode được khai báo thì đổ màu lên hình ảnh
					//Khi đổ màu, vì thiết lập globalCompositeOperation nên chỉ vẽ được 1 hình ảnh lên canvas. Do đó phải sử dụng canvas phụ tempCanvas
					tempContext.globalCompositeOperation = "source-in";
					tempContext.fillStyle = colorCode;
					tempContext.fillRect(0, 0, 1500, 1125);
				}

				//Vẽ nội dung của canvas phụ tempCanvas lên canvas chính, để có thể vẽ nhiều image lên 1 canvas.
				context.drawImage(tempContext.canvas, 0, 0);

				//Thiết lập canvas phụ về mặc định, để dùng cho lần vẽ tiếp theo
				tempContext.globalCompositeOperation = "source-over";
				tempContext.clearRect(
					0,
					0,
					tempCanvas.width,
					tempCanvas.height
				);
				resolve("Draw image successfully");
			} catch (error) {
				reject(error);
			}
		});
	};


	//Mock-up data
	let images = [{
			url: "./../img/nem-w.png",
			colorCode: "#dfc8c2"
		},
		{
			url: "./../img/men-b-w.png",
			colorCode: "#ff0000"
		},
		{
			url: "./../img/men-f-w.png",
			colorCode: "#223a5e"
		},
		{
			url: "./../img/goi-w.png",
			colorCode: "#223a5e"
		},
		{
			url: "./../img/goiom-w.png",
			colorCode: "#4d4155"
		}
	];

	//Không đụng gì đến phần này. Đây là ảnh sẽ phủ lớp nếp gấp lên cho hình ảnh
	const _imagesCover = [{
			url: "./../img/nem-s.png",
			colorCode: ""
		},
		{
			url: "./../img/men-b-s.png",
			colorCode: ""
		},
		{
			url: "./../img/men-f-s.png",
			colorCode: ""
		},
		{
			url: "./../img/goi-s.png",
			colorCode: ""
		},
		{
			url: "./../img/goiom-s.png",
			colorCode: ""
		}
	];

	//Tạo 2 canvas phục vụ cho việc render hình ảnh và đổ màu
	createCanvas('myCanvas', 1500, 1125)
	createCanvas('tempCanvas', 1500, 1125)

	//Cú pháp dùng để gọi 1 series promise theo thứ tự được khai báo trong 1 Array
	// Code được lấy từ https://hackernoon.com/functional-javascript-resolving-promises-sequentially-7aac18c4431e
	const serial = funcs =>
		funcs.reduce(
			(promise, func) =>
			promise
			.then(result =>
				func().then(Array.prototype.concat.bind(result))
			)
			.catch(error => Array.prototype.concat.bind(error)),
			Promise.resolve([])
		);

	const funcs = images.map(image => () =>
		createImage(image.url)
		.then(img => drawImage(img, image.colorCode))
		.catch(error => console.log(error))
	);

	const funcsCover = _imagesCover.map(image => () =>
		createImage(image.url)
		.then(img => drawImage(img, image.colorCode))
		.catch(error => console.log(error))
	);

	serial(funcs).then(() => {
		serial(funcsCover).then(() => {
			let canvas = document.getElementById("myCanvas");
			let tempCanvas = document.getElementById('tempCanvas')
			let imgBase64 = canvas.toDataURL();

			//Tạo thẻ a để làm trung gian download, ngay khi download sẽ remove khỏi DOM.
			let imageLink = document.createElement("a");
			imageLink.setAttribute("href", imgBase64);
			imageLink.setAttribute("download", "liena-" + Math.floor(Math.random() * 999999) + 99999 + ".png");

			imageLink.style.display = "none";
			document.body.appendChild(imageLink);
			imageLink.click();
			document.body.removeChild(imageLink);

			//Remove 2 canvas ra khỏi cây DOM
			document.body.removeChild(canvas);
			document.body.removeChild(tempCanvas);
		});
	});
}