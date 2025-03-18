document.addEventListener("DOMContentLoaded",function(){let t=io();t.on("new_transaction",t=>{let e=document.querySelector("#table-transaction"),n=document.createElement("tr");n.classList.add("fade-in"),n.innerHTML=`
  <td><a href="/transaction/${t.txid}">${t.txid}</a></td>
  <td>${parser(t).sender}</td>
  <td>${parser(t).receiver}</td>
  <td><span class="points">${t.amount}</span></td>
  <td class="age" data-timestamp="${t.timestamp}"></td>
  <td>${t.title}</td>
`,e.insertBefore(n,e.firstChild),e.rows.length>10&&(lastRow=e.rows[e.rows.length-1],e.removeChild(lastRow)),updateAgeColumn()})});