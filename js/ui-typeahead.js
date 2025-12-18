/* -------------------------------
   Typeahead logic (generic)
-------------------------------- */
function setupTypeahead({inputId, listId, xId, getValue, setValue, onPick, onEnterNoPick, onClear, filterFn, renderOpt}){
  const input = $(inputId);
  const list = $(listId);
  const x = $(xId);

  if (!input || !list || !x) return;
  x.dataset.kind = "typeahead";
  x.dataset.target = inputId;

  function refreshX(){
    const v = (input.value||"").trim();
    x.classList.toggle("show", v.length>0);
  }

  function close(){
    list.classList.remove("open");
    list.innerHTML = "";
  }

  function openWith(items){
    if (!items.length){ close(); return; }
    list.innerHTML = items.map(renderOpt).join("");
    list.classList.add("open");

    // click handlers for each opt
    Array.from(list.children).forEach((node, idx)=>{
      node.addEventListener("click", ()=>{
        const dcw = items[idx];
        onPick(dcw);
        close();
      });
    });
  }

  function update(){
    let q = input.value || "";
    const filter = input.dataset.filter || "";
    if (filter){
      const sanitized = sanitizeByFilter(filter, q);
      if (sanitized !== q){
        q = sanitized;
        input.value = sanitized;
      }
    }
    setValue(q);
    refreshX();
    const items = filterFn(q);
    openWith(items.slice(0, 7));
  }

  input.addEventListener("input", update);

  input.addEventListener("keydown", (e)=>{
    if (e.key === "Enter"){
      // If list open and first item exists, do NOT auto-pick.
      // Requirement: allow Enter without selection -> create new record.
      e.preventDefault();
      close();
      onEnterNoPick && onEnterNoPick();
    }
    if (e.key === "Escape"){
      close();
    }
  });

  x.addEventListener("click", ()=>{
    onClear && onClear();
    close();
  });

  // click outside
  document.addEventListener("click", (e)=>{
    const t = e.target;
    if (t === input || list.contains(t) || t === x) return;
    close();
  });

  refreshX();
}
