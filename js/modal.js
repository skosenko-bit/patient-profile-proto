/* -------------------------------
   Modal
-------------------------------- */
function openModal({title, text, buttons}){
  $("modalTitle").textContent = title;
  $("modalText").textContent = text;
  const f = $("modalFooter");
  f.innerHTML = "";
  buttons.forEach(b=>{
    const btn = document.createElement("button");
    btn.className = "btn " + (b.kind||"");
    btn.type = "button";
    btn.textContent = b.label;
    btn.addEventListener("click", ()=>{
      closeModal();
      b.onClick && b.onClick();
    });
    f.appendChild(btn);
  });
  $("modalOverlay").classList.add("open");
  $("modalOverlay").setAttribute("aria-hidden","false");
}
function closeModal(){
  $("modalOverlay").classList.remove("open");
  $("modalOverlay").setAttribute("aria-hidden","true");
}

