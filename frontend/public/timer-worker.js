// Este worker se encarga de mantener un reloj constante
// Incluso si la pestaña principal se minimiza o entra en ahorro de energía.

setInterval(() => {
    self.postMessage('TICK');
}, 30000); // Latido cada 30 segundos
