function updateAgeColumn(){let e=document.querySelectorAll(".age");setInterval(()=>{e.forEach(e=>{let t=parseInt(e.dataset.timestamp,10);e.textContent=calculateAge(t)})},1e3)}function calculateAge(e){let t=Date.now(),a=Math.floor((t-e)/1e3);return a<60?`${a}s ago`:a<3600?`${Math.floor(a/60)}m ago`:a<86400?`${Math.floor(a/3600)}h ago`:`${Math.floor(a/86400)}d ago`}function parser(e){let t="system"!==e.sender?`<a href="/users/${e.sender}">${e.sender}</a>`:"<span class='uk-text-meta'>system</span>",a="system"!==e.receiver?`<a href="/users/${e.receiver}">${e.receiver}</a>`:"<span class='uk-text-muted'>system</span>";return{sender:t,receiver:a}}document.addEventListener("DOMContentLoaded",async()=>{let e=0,t=10,a="All",n=0,s=10,r=document.getElementById("search-input"),i=document.getElementById("search-button"),l=document.getElementsByClassName("search-hint"),o=document.getElementById("load-more"),d=document.documentElement,c=d.getAttribute("data-page");if(i.addEventListener("click",()=>{l[0].innerHTML='<div class="spinner"></div>',search(r.value)}),"transaction"==c){let p=d.getAttribute("data-txid");loadTransactionByTxid(p),loadTransactions(e,t,o)}if("user"!=c&&o.addEventListener("click",()=>{e+=10,t+=10,o.innerHTML=`
  <div class="spinner"></div>`,loadTransactions(e,t,o)}),"user"==c){let u=d.getAttribute("data-username"),h=document.getElementById("filterTransactions");o.addEventListener("click",()=>{"All"==a?(e+=10,t+=10,o.innerHTML=`
  <div class="spinner"></div>`,loadUserTransaction(u,e,t,o)):"Tip"==a&&(n+=10,s+=10,o.innerHTML=`
  <div class="spinner"></div>`,loadFilteredUserTransaction(u,a,n,s,o))}),h.addEventListener("change",function(){n=0,s=10,loadFilteredUserTransaction(u,a=this.value,n,s)}),loadUserTransaction(u,e,t,o),loadUserDetails(u);return}if("home"==c){analytics(),loadTransactions(e,t,o);return}}),loadTransactions=async(e,t,a)=>{fetch(`/api/transactions/${e}/${t}`).then(e=>e.json()).then(e=>{200===e.status?(renderTransactions(e.data),a.innerHTML="Load More"):notFound()}).catch(e=>console.error(e))},loadTransactionByTxid=async e=>{fetch(`/api/transactions/${e}`).then(e=>e.json()).then(e=>{200===e.status?renderSingleTransacion(e.data):notFound()}).catch(e=>console.error(e))},renderSingleTransacion=e=>{let t=`
<li>Type <span>${e.type}</span></li>
<li>Amount <span class="points">${e.amount}</span></li>
<li>From ${parser(e).sender}</li>
<li>To ${parser(e).receiver}</li>
<li>Transactions ID <span>${e.txid}</span></li>
<li>Age <span>${calculateAge(e.timestamp)}</span></li>

`,a=document.querySelector(".table-list");a.innerHTML=t},renderTransactions=e=>{removeTableTransactionSkeleton();let t=document.getElementById("table-transaction");e.forEach(e=>{let a=document.createElement("tr");a.innerHTML=`
      <td><a href="/transaction/${e.txid}">${e.txid}</a></td>
 <td>${parser(e).sender}</td>
            <td>${parser(e).receiver}</td>
            <td><span class="points">${e.amount}</span></td>
            <td class="age" data-timestamp="${e.timestamp}">${calculateAge(e.timestamp)}</td>
            <td>${e.type}</td>
    `,t.appendChild(a)})},loadUserTransaction=(e,t,a,n)=>{fetch(`/api/users/${e}/transactions/${t}/${a}`).then(e=>e.json()).then(e=>{200===e.status?(renderUserTransactions(e.data),n.innerHTML="Load More"):notFound()}).catch(e=>console.error(e))},renderUserTransactions=e=>{let t=document.getElementById("table-transaction");e.data.forEach(e=>{let a=document.createElement("tr");a.innerHTML=`
      <td><a href="/transaction/${e.txid}">${e.txid}</a></td>
 <td>${parser(e).sender}</td>
            <td>${parser(e).receiver}</td>
            <td><span class="points">${e.amount}</span></td>
            <td class="age" data-timestamp="${e.timestamp}">${calculateAge(e.timestamp)}</td>
            <td>${e.type}</td>
    `,t.appendChild(a),removeTableTransactionSkeleton()})},loadUserDetails=e=>{fetch(`/api/users/${e}`).then(e=>e.json()).then(e=>{200===e.status?renderUserDetails(e.data):notFound()}).catch(e=>console.error(e))},renderUserDetails=e=>{let t=`
<li>Username <span>${e.username}</span></li>
<li>Balance <span class="points">${e.balance}</span></li>
<li>Transactions Counts <span>${e.tx_count}</span></li>
<li>Last Updated <span>${calculateAge(e.last_updated)}</span></li>

`,a=document.querySelector(".table-list");a.innerHTML=t},loadFilteredUserTransaction=(e,t,a,n)=>{let s=document.getElementById("load-more");if(0===a&&(document.getElementById("table-transaction").innerHTML=""),"All"===t){loadUserTransaction(e,a,n,s);return}fetch(`/api/users/${e}/transactions/type/${t}/${a}/${n}`).then(e=>e.json()).then(e=>{200===e.status?(renderUserTransactions(e),s.innerHTML="Load More"):notFound()}).catch(e=>console.error(e))},removeTableTransactionSkeleton=()=>{let e=document.querySelectorAll(".table-skeleton");if(0===e.length)return!1;document.getElementById("table-transaction").innerHTML=""},notFound=()=>{let e=`
 <div class="center">
        <h1>404 - Not Found</h1>
        <p>
          We Can't Find The Data You're Looking For, The Reason Is The Data
          Not yet indexed or not found.
        </p>

        <a href="/">Return to Homepage</a>`;document.getElementsByTagName("main")[0].innerHTML=e},search=e=>{e.length>=24?fetch(`/api/transactions/${e}`).then(e=>e.json()).then(e=>{200===e.status?renderSearchHint("Transaction",e.data.txid,"/transaction/"+e.data.txid):renderNotFound("Transaction")}):fetch(`/api/users/${e}`).then(e=>e.json()).then(e=>{200===e.status?renderSearchHint("Users Account",e.data.username,"/users/"+e.data.username):renderNotFound("Users Account")})},renderSearchHint=(e,t,a)=>{let n=`
<span>${e}</span>
<div class="search-hint-wrap">
<img
  src="https://api.dicebear.com/9.x/notionists-neutral/png?seed=${t}"
  alt=""
  class="avatar"
/>
<a href="${a}">${t}</a>
</div>
`,s=document.getElementsByClassName("search-hint");s[0].innerHTML=n},renderNotFound=e=>{let t=`<div class="search-hint-wrap">
    <span class="danger">Seems Like You Trying Search For ${e} But With Zero Result :(</span>
  </div>`,a=document.getElementsByClassName("search-hint");a[0].innerHTML=t};const analytics=()=>{let e=async()=>{try{let e=await fetch("/api/stats"),s=await e.json();200===s.status?(t(s),a(s)):n()}catch(r){console.error("Error fetching stats:",r)}},t=e=>{renderChart(e.monthlyTransactions),renderStats(e.totalTransactions,e.dailyTransactions)},a=e=>{let t={storedSince:Date.now(),data:e};localStorage.setItem("stats",JSON.stringify(t))},n=()=>{renderNotFound("Users Account")},s=()=>{let e=localStorage.getItem("stats");if(!e)return null;let{storedSince:t,data:a}=JSON.parse(e),n=Date.now()-t<36e5;return n?a:null},r=s();r?t(r):e()};renderChart=e=>{let t=new Date,a=t.getMonth(),n=t.getFullYear();t.getDate();let s=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",],r=getDaysInMonth(a,n),i=Array.from({length:r},(e,t)=>`${s[a]} ${t+1}`),l=e.reduce((e,t)=>(e[t.date]=t.counts,e),{}),o=Array.from({length:r},(e,t)=>{let s=`${n}-${String(a+1).padStart(2,"0")}-${String(t+1).padStart(2,"0")}`;return l[s]||0}),d={series:[{name:"Transactions",data:o},],chart:{height:150,type:"line",toolbar:{show:!1},zoom:{enabled:!1},background:"transparent"},xaxis:{labels:{show:!1},axisBorder:{show:!1},axisTicks:{show:!1}},yaxis:{labels:{show:!1}},grid:{show:!1},tooltip:{enabled:!0,theme:"dark",custom:function({series:e,seriesIndex:t,dataPointIndex:a,w:n}){let s=i[a],r=e[t][a];return`<div style="background: #1a1a1a; color: white; padding: 10px; border-radius: 5px;"><strong>${s}</strong><br>Transactions: ${r}</div>`}},stroke:{curve:"smooth",width:2},colors:["#FFD700"],markers:{size:0}},c=document.querySelector("#chart");c.innerHTML="";let p=new ApexCharts(c,d);p.render()},renderStats=(e,t)=>{document.getElementById("total").innerHTML=`<h3>${e}</h3>`,document.getElementById("daily").innerHTML=`<h3>${t}</h3>`},getDaysInMonth=(e,t)=>new Date(t,e+1,0).getDate();