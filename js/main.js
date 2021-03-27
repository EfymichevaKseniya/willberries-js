const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

//cart

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const modalClose = document.querySelector('.modal-close');
const modalOverlay = document.querySelector('.overlay');
const viewAll = document.querySelectorAll('.view-all');
const navigationLink = document.querySelectorAll('.navigation-link:not(.view-all)');
const longGoodsList = document.querySelector('.long-goods-list');
const btnAccessories = document.querySelector(".btn-accessories");
const btnClothing = document.querySelector('.btn-clothing');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cartTableTotal = document.querySelector('.card-table__total');
const cartCount = document.querySelector('.cart-count');
const btnClear = document.querySelector('.clear');

const getGoods = async function() {
	const result = await fetch('db/db.json');
	if (!result.ok) {
		throw 'Ошибка'+ result.status
	}
	return await result.json();
};


// scroll smooth

{
	const scrollLinks = document.querySelectorAll('a.scroll-link');

	for (const scrollLink of scrollLinks) {
		scrollLink.addEventListener('click', event => {
			event.preventDefault();
			const id = scrollLink.getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			})
		});
	}
}

const cart = {
	cartGoods: [],

	getCountCart()  {
		return this.cartGoods.length;
	}, 

	countQuantity() {
		const count = this.cartGoods.reduce((sum, item) => { 
			return sum + item.count;
		}, 0);

		cartCount.textContent = count ? count : '';

	},

	clearGood() {
		this.cartGoods.length = 0;
		this.countQuantity();
		this.renderCart();
	},

	renderCart(){
		cartTableGoods.textContent = "";
		this.cartGoods.forEach(({id, name, price, count}) => {
			const trGood = document.createElement('tr');
			trGood.className = 'cart-item';
			trGood.dataset.id = id;

			trGood.innerHTML = `
					<td>${name}</td>
					<td>${price}$</td>
					<td><button class="cart-btn-minus">-</button></td>
					<td>${count}</td>
					<td><button class="cart-btn-plus">+</button></td>
					<td>${price * count}$</td>
					<td><button class="cart-btn-delete">x</button></td>
			`;
			cartTableGoods.append(trGood);
		});
		const totalPrice = this.cartGoods.reduce((sum, item) => {
			return sum + (item.price * item.count);
		}, 0);

		cartTableTotal.textContent = totalPrice + '$';
	},
	deleteGood(id){
		this.cartGoods = this.cartGoods.filter(item => id !== item.id);
		this.renderCart();
		this.countQuantity();
	},
	minusGood(id){
		for (const item of this.cartGoods) {
			if (item.id === id) {
				if (item. count <= 1) {
					this.deleteGood(id);
				} else {	
					item.count--;
				}
				break;
			}
		}
		this.renderCart();
		this.countQuantity();
	},
	plusGood(id){
		for (const item of this.cartGoods) {
			if (item.id === id) {
				item.count++;
				break;
			}
		}
		this.renderCart();
		this.countQuantity();
	},
	
	addCartGoods(id){
		const goodItem = this.cartGoods.find(item => item.id === id);
		if (goodItem) {
			this.plusGood(id);
		} else {
			getGoods()
				.then(data => data.find(item => item.id === id))
				.then(({ id, name, price}) => {
					this.cartGoods.push({
						id,
						name,
						price,
						count: 1 
					});
					this.countQuantity();
				});
		}
	},
	
}

// btnClear.addEventListener('click', cart.clearGood.bind(cart));

btnClear.addEventListener('click', () => {
	cart.clearGood();
});

document.body.addEventListener('click', (e) => {
	const addToCart = e.target.closest('.add-to-cart');
	if (addToCart) {
		cart.addCartGoods(addToCart.dataset.id);
	}
});



cartTableGoods.addEventListener('click', (e) => {
	const target = e.target;

	if (target.tagName === "BUTTON") {
		const id = target.closest('.cart-item').dataset.id;

		if (target.classList.contains('cart-btn-delete')) {
			cart.deleteGood(id);
		}
		if (target.classList.contains('cart-btn-minus')) {
			cart.minusGood(id)
		}
		if (target.classList.contains('cart-btn-plus')) {
			cart.plusGood(id);
		}			
	}
	
});

const openModal = function() {
	cart.renderCart();
	modalCart.classList.add('show');
};

const closeModal = function() {
	modalCart.classList.remove('show');
};



try {
	buttonCart.addEventListener('click', openModal); 
} catch (e) {
	console.log('нет кнопки');
}

document.getElementById('modal-cart')
		.addEventListener('click', function(event) {
			if (event.target === modalClose  || event.target === modalOverlay) {
				closeModal();
			}
		});

// goods



const createCard = function({label, name, img, description, id, price}) {
	const card = document.createElement('div');
	card.className = "col-lg-3 col-sm-6";
	
	card.innerHTML = `
		<div class="goods-card">
			${label ?  `<span class="label">${label}</span>`: ''}
			
			<img class="goods-image" src="db/${img}" alt="${name}">
			<h3 class="goods-title">${name}</h3>
			<p class="goods-description">${description}</p>
			<button class="button goods-card-btn add-to-cart" data-id="${id}">
				<span class="button-price">$${price}</span>
			</button>
		</div>`;

	return card;
};

const renderCards = function(data) {
	longGoodsList.textContent = '';
	const cards = data.map(createCard)

	longGoodsList.append(...cards);
	document.body.classList.add('show-goods');
};


const showAll =  function (event) {
	event.preventDefault();
	getGoods().then(renderCards);
};

viewAll.forEach(elem => {
	elem.addEventListener('click', showAll);
});


const filterCards = function(field, value) {
	getGoods().then(data => data.filter(good => good[field] === value))
	.then(renderCards);
};

navigationLink.forEach(function (link) {
	link.addEventListener('click', event => {
		event.preventDefault();
		const field = link.dataset.field;
		const value = link.textContent;
		filterCards(field, value);
	});
});


//bunner

btnAccessories.addEventListener("click", function(e) {
	e.preventDefault();
	filterCards('category', 'Accessories');
});


btnClothing.addEventListener("click", function(e) {
	e.preventDefault();
	filterCards('category', 'Clothing');
});

// day 4

const modalForm = document.querySelector('.modal-form');


const postData = dataUser => fetch('server.php', {
	method: 'POST',
	body: dataUser,
});

const validForm = (formData) => {
	let valid = false;

	for (const [, value] of formData) {
		if (value.trim())  {
			valid = true;
		} else {
			valid = false;
			break;
		}
	}

	return valid;
}

modalForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const formData = new FormData(modalForm);

	if (validForm(formData) && cart.getCountCart()) {
		
		formData.append('cart', JSON.stringify('cart.cartGoods'));

		postData(formData)
		.then(response => {
			if(!response.ok) {
				throw new Error(response.status);
			} else {
				alert('Ваш заказ успешно отправлен');
			}
		})
		.catch(error => {
			alert('Произошла ошибка. Повторите попытку позже');
		})
		.finally(() => {
			closeModal();
			modalForm.reset();
			cart.clearGood();
			});
	} else if (!cart.getCountCart()) {
			alert ('Добавьте товары в корзину');

	} else if (!validForm(formData)) {
			alert ('Заполните поля');
	}

});



		

	

	


