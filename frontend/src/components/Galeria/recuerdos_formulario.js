(() => {
 'use strict';
 const form=document.getElementById('recuerdoForm'), button=document.getElementById('enviarRecuerdo'), status=document.getElementById('formStatus');
 const endpoint=new URL('../../../backend/recuerdos.php',document.baseURI);
 let csrf='', previewURL;
 // Keep select labels floating for selections, restored values and form resets.
 const floatingSelects = form.querySelectorAll('.mem-floating select');
 const syncLabels = () => floatingSelects.forEach(select => select.parentElement.classList.toggle('has-value', select.value !== ''));
 floatingSelects.forEach(select => select.addEventListener('change', syncLabels));
 form.addEventListener('reset', () => setTimeout(syncLabels, 0));
 window.addEventListener('pageshow', syncLabels);
 syncLabels();
 // El backend actual recibe «anio» como número. El campo visual usa un calendario,
 // pero se envía únicamente el año para mantener compatible la API existente.
 const fechaRecuerdo = form.elements.anio;
 const hoy = new Date();
 fechaRecuerdo.max = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
 // El token de seguridad se solicita automáticamente: no se muestra un botón de reintento.
 let conectandoSesion=false;
 async function sesion(){
  if(conectandoSesion || csrf)return;
  conectandoSesion=true;
  button.disabled=true;
  status.textContent='Preparando formulario…';
  try{
   const r=await fetch(endpoint+'?sesion=1',{credentials:'same-origin'});
   const data=await r.json();
   if(!r.ok || !data.csrf)throw Error();
   csrf=data.csrf;
   delete status.dataset.error;
   button.disabled=false;
   status.textContent='';
  }catch{
   status.dataset.error='true';
   status.textContent='No se pudo conectar con el servidor. El formulario se habilitará al recuperar la conexión.';
  }finally{conectandoSesion=false;}
 }
 // Si la conexión falla al entrar, se recupera al volver a la página o tener Internet.
 window.addEventListener('online',sesion);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sesion();});
 sesion();
 form.elements.foto.addEventListener('change',()=>{
  const f=form.elements.foto.files[0], img=document.getElementById('fotoPreview');
  if(previewURL)URL.revokeObjectURL(previewURL);img.hidden=true;
  form.elements.foto.setCustomValidity('');
  if(!f)return;
  if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>3*1024*1024){form.elements.foto.setCustomValidity('Elegí una imagen JPG, PNG o WebP de hasta 3 MB.');form.elements.foto.reportValidity();return;}
  previewURL=URL.createObjectURL(f);img.src=previewURL;img.hidden=false;
 });
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(button.disabled||!form.reportValidity())return;
  button.disabled=true;status.dataset.error='false';status.textContent='Enviando tu recuerdo…';
  const data=new FormData(form);
  data.set('anio', fechaRecuerdo.value ? fechaRecuerdo.value.slice(0,4) : '');
  data.set('csrf',csrf);
  try{const r=await fetch(endpoint,{method:'POST',body:data,credentials:'same-origin'});const result=await r.json();if(!r.ok)throw Error(result.error||'No se pudo enviar.');
   form.reset();document.getElementById('fotoPreview').hidden=true;if(previewURL)URL.revokeObjectURL(previewURL);status.textContent=result.mensaje;button.textContent='Recuerdo enviado';
  }catch(error){status.dataset.error='true';status.textContent=error.message==='Failed to fetch'?'No se pudo confirmar el envío. Revisá tu conexión.':error.message;button.disabled=false;}
 });
})();
