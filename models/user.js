const { supabase } = require('../util/database');

class user {
    constructor(email,password) {
        this.email = email;
        this.password = password;
    }
    static async createUser(email, password) {
        const { data, error } = await supabase
            .from('user')
            .insert([{ email, password }])
            .select()
            .single();
        if (error) throw error;
        return new user(email, password);
    }

    static async login(email, password) {
        const { data, error } = await supabase
            .from('user')
            .select('*')
            .eq('email', email)
            .eq('password', password)
            .single();
        if (error) throw error;
        return new user(data.email, data.password);
    }

}

module.exports = user;