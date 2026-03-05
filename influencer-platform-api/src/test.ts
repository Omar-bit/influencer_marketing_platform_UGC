import bcrypt from 'bcrypt';
(async function (pass: string = '123456') {
  try {
    const salt = await bcrypt.genSalt(10);

    const password = await bcrypt.hash(pass, salt);
    console.log('Password', password);
  } catch (err) {
    console.log(err);
  }
})('50302236Omar!');
