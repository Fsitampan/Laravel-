<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get('/Dashboard')->assertRedirect('/login');
});

test('authenticated users can visit the Dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get('/Dashboard')->assertOk();
});