import keys from "../Js/keys.js"

const $d = document;
const $Metodpag = $d.getElementById("Metodpag");
const $template = $d.getElementById("paqueS-template").content;
const $fragment = $d.createDocumentFragment();
const options = {headers: {authorization : `Bearer ${keys.secret}`} }
const FormatoMoneda = num =>`$ ${num.slice(0,-2)}.${num.slice(-2)}`;

let products, prices;

Promise.all([
    fetch("https://api.stripe.com/v1/products", options),
    fetch("https://api.stripe.com/v1/prices", options)
])

    .then(responses => Promise.all(responses.map(res => res.json())))
    .then (json=>{
    products=json[0].data;
    prices =json[1].data;
    console.log(products, prices)

    prices.forEach(el => {
        let productData = products.filter(product => product.id === el.product);
    

        $template.querySelector(".paqueS").setAttribute("data-price",el.id);
        $template.querySelector("img").src=productData[0].images[0];
        $template.querySelector("img").alt=productData[0].name;
        $template.querySelector("figcaption").innerHTML=`${productData[0].name} ${FormatoMoneda(el.unit_amount_decimal)} ${(el.currency).toUpperCase()}`;

        let $clone=$d.importNode($template, true);

        $fragment.appendChild($clone);

    })

    $Metodpag.appendChild($fragment);
})

.catch(error =>{
    let message = error.statuText|| "Ocurrio un error en la petición.";

    $Metodpag.innerHTML =`Error: ${error.status}:${message}`;
})

$d.addEventListener("click",e=>{
    if (e.target.matches(".paqueS *")){
        let priceId=e.target.parentElement.getAttribute("data-price");

        Stripe(keys.public).redirectToCheckout({
            lineItems:[{
                price: priceId,
                quantity: 1
            }],
            mode:"suscription",
            successUrl:"http://127.0.01:5500/success.html",
            cancelUrl:"http://127.0.01:5500/cancel.html"

        })
        .then(res=>{
            if(res.error){
                $Metodpag.insertAdjacentElement("beforeend",res.error.message)
            }
        })
    }
})