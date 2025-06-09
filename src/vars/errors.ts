export const genError = `Bot skill issue - something went wrong.`;

export const timeout = `The connection timed out`;

export const paramFileMissing = `This command has expired and the buttons can no longer be used.\nCommands will automatically expire after 24h of not being used.`;

export function anyError() {
    const errs = [
        'Bot is having a skill issue lol.',
        'Error - AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        'Error - something went wrong.',
        'Error - ????????!?!??!',
    ];

    return errs[Math.floor(Math.random() * errs.length)];
}

export const uErr = {
    admin: {
        channel: {
            msid: 'Invalid channel id'
        },
        purge: {
            msc: 'Missing arg [COUNT]',
            unf: 'Could not find user with id [ID]',
            fail: 'There was an error trying to delete [COUNT] message(s)',
            failTime: 'You cannot purge messages over 14 days old'
        }
    },
    arg: {
        ms: 'Missing arg [ID]',
        type: 'arg [ID] is the wrong type',
        nf: 'Could not find arg [ID]',
        inaccess: 'Could not find [TYPE] with id [ID]'
    },
};